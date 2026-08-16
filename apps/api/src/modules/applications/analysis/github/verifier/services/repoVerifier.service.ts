import { createHash } from "crypto";
import { PoolClient } from "pg";
import { getDb } from "../../../../../../config/db";
import { withTransaction } from "../../../../../../config/transaction";
import { verifyRepositories } from "../client/verifier.client";
import {
  getCompletedRepositoryAnalysisId,
  getRepositoryVerifierPayload,
} from "../evaluationContext/repoVerifierPayload";
import {
  beginVerifierRun,
  checkpointVerifierResponse,
  completeVerifierRun,
  failVerifierRun,
  getVerifierCheckpoint,
} from "../helpers/checkpoint";
import {
  persistEvidenceUnits,
  persistRepositoryScoreRun,
} from "../helpers/persistVerifier";
import { computeRepositoryScore } from "../../../../../scoring/repository/repositoryScore.service";
import {
  CanonicalJobRequirement,
  RepositoryVerifierReport,
} from "../../../../../scoring/repository/repositoryScores.types";

const VERIFIER_MODEL =
  process.env.LLM_MODEL ?? "deepseek-ai/deepseek-v4-flash";
const VERIFIER_PROMPT_VERSION =
  process.env.REPOSITORY_VERIFIER_PROMPT_VERSION ?? "v1";
const SCORER_SOURCE_REVISION =
  process.env.REPOSITORY_SCORER_SOURCE_REVISION ?? "local-unversioned";

function hashJson(value: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(value))
    .digest("hex");
}

function canonicalRequirements(jobContext: unknown): CanonicalJobRequirement[] {
  const context = (jobContext ?? {}) as Record<string, unknown>;
  const groups = (context.requirements ?? {}) as Record<string, unknown>;
  const result: CanonicalJobRequirement[] = [];

  for (const [groupName, priority] of [
    ["mandatory", "MANDATORY"],
    ["preferred", "PREFERRED"],
    ["bonus", "BONUS"],
  ] as const) {
    const items = Array.isArray(groups[groupName]) ? groups[groupName] : [];

    for (const value of items) {
      if (!value || typeof value !== "object") continue;
      const item = value as Record<string, unknown>;
      const name = String(item.name ?? "").trim();
      const type = String(item.type ?? "").trim();
      const weight = Number(item.weight ?? 0);

      if (!name || !type || !Number.isFinite(weight) || weight < 0) {
        throw new Error(`Invalid canonical job requirement: ${name}`);
      }

      result.push({
        name,
        type,
        priority,
        weight,
      });
    }
  }

  return result;
}

async function getStage1Score(applicationId: string): Promise<number> {
  const result = await getDb().query<{ final_alignment_score: number | string }>(
    `
    SELECT final_alignment_score
    FROM application_resume_analyses
    WHERE job_application_id = $1
      AND is_current = true
    LIMIT 1
    `,
    [applicationId],
  );

  const score = Number(result.rows[0]?.final_alignment_score);
  if (!Number.isFinite(score)) {
    throw new Error(`No current Stage 1 score for application ${applicationId}`);
  }
  return score;
}

function asVerifierReport(value: Record<string, unknown>): RepositoryVerifierReport {
  return value as unknown as RepositoryVerifierReport;
}

/**
 * Keep malformed LLM negatives from becoming capability penalties. A
 * complete-negative state is only meaningful with complete retrieval; when
 * the model emits it with partial coverage, preserve the raw response but
 * score the cleaned report as neutral/unassessable.
 */
function sanitizeVerifierReport(report: RepositoryVerifierReport): RepositoryVerifierReport {
  const cleaned = structuredClone(report) as RepositoryVerifierReport;

  for (const mapping of cleaned.requirement_mappings) {
    const completeNegative =
      mapping.evidence_state === "NOT_DEMONSTRATED_IN_COMPLETE_SCOPE" ||
      mapping.evidence_state === "CONTRADICTED_BY_RETRIEVED_CODE";

    if (
      completeNegative &&
      (mapping.assessment_scope !== "REPOSITORY_VERIFIABLE" ||
        mapping.requirement_coverage_score < 90)
    ) {
      mapping.evidence_state = "UNASSESSABLE_FROM_REPOSITORY";
      mapping.requirement_evidence_score = 50;
      mapping.requirement_coverage_score = 0;
      mapping.scope_note = `${mapping.scope_note} Complete-negative state was downgraded because retrieved coverage was below 90; no penalty was applied.`.trim();
    }
  }

  return cleaned;
}

export async function repoVerifier(
  jobId: string,
  applicationId: string,
  taskId: string,
): Promise<void> {
  const startedAt = Date.now();
  const repositoryAnalysisId =
    await getCompletedRepositoryAnalysisId(applicationId);
  const payload = await getRepositoryVerifierPayload(
    applicationId,
    jobId,
    repositoryAnalysisId,
  );
  const requestHash = hashJson(payload);
  const db = getDb();
  const existing = await getVerifierCheckpoint(
    db as unknown as PoolClient,
    repositoryAnalysisId,
  );
  const runId = await withTransaction((client) =>
    beginVerifierRun(
      client,
      repositoryAnalysisId,
      requestHash,
      VERIFIER_MODEL,
      VERIFIER_PROMPT_VERSION,
    ),
  );

  try {
    const cached =
      existing &&
      existing.verifier_input_hash === requestHash &&
      existing.raw_llm_response &&
      existing.cleaned_report &&
      existing.evidence_snapshot
        ? {
            report: existing.cleaned_report,
            raw_llm_response: existing.raw_llm_response,
            repository_evidence: existing.evidence_snapshot,
          }
        : null;

    const response = cached ?? (await verifyRepositories(
      applicationId,
      jobId,
      taskId,
      undefined,
      repositoryAnalysisId,
    ));

    if (!response.repository_evidence) {
      throw new Error("Verifier response did not include repository evidence");
    }

    const report = sanitizeVerifierReport(asVerifierReport(response.report));
    const stage1Score = await getStage1Score(applicationId);
    const jobContext = payload.evaluation_context.job_context;
    const requirements = canonicalRequirements(jobContext);
    const repositoryEvidence = response.repository_evidence;
    const reportHash = hashJson(report);
    const snapshotHash = hashJson(repositoryEvidence);
    const score = computeRepositoryScore({
      applicationId,
      stage1Score,
      requirements,
      report,
      provenance: {
        stage1ReportHash: hashJson(payload.stage_1_report),
        stage2aReportHash: hashJson(payload.stage_2a_report),
        repositorySnapshotManifestHash: snapshotHash,
        verifierReportHash: reportHash,
        verifierPromptVersion: VERIFIER_PROMPT_VERSION,
        verifierModel: VERIFIER_MODEL,
      },
    });

    await withTransaction(async (client) => {
      await checkpointVerifierResponse(
        client,
        runId,
        response.raw_llm_response ?? JSON.stringify(response.report),
        response.report,
        repositoryEvidence,
      );
      await persistEvidenceUnits(client, runId, repositoryEvidence);
      await persistRepositoryScoreRun(
        client,
        runId,
        repositoryAnalysisId,
        score,
        SCORER_SOURCE_REVISION,
      );
      await completeVerifierRun(client, runId, reportHash);
    });

    console.log("[RepoVerifier][completed]", {
      taskId,
      runId,
      combinedScore: score.combinedScore,
      repositoryAdjustment: score.repositoryAdjustment,
      elapsedMs: Date.now() - startedAt,
      usedCachedResponse: Boolean(cached),
    });
  } catch (error) {
    await withTransaction((client) => failVerifierRun(client, runId, error));
    throw error;
  }
}
