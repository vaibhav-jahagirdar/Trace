import { createHash } from "crypto";
import { PoolClient } from "pg";
import { getDb } from "../../../../../../config/db";
import { withTransaction } from "../../../../../../config/transaction";
import { buildFinalInterviewShortlist } from "../../../../../scoring/repository/finalShortlist.service";
import { REPOSITORY_SCORE_POLICY } from "../../../../../scoring/repository/repositoryScore.policy";
import { RankedRepositoryCandidate } from "../../../../../scoring/repository/finalShortlist.service";
import { RepositoryScoreResult } from "../../../../../scoring/repository/repositoryScores.types";

interface ScoreRow {
  application_id: string;
  score_run_id: string;
  policy_version: string;
  stage1_score: number | string;
  repository_evidence_score: number | string;
  repository_coverage_score: number | string;
  repository_adjustment: number | string;
  combined_score: number | string;
  assessed_requirement_weight: number | string;
  total_requirement_weight: number | string;
  mandatory_complete_negative_count: number;
  direct_claim_contradiction_count: number;
  observed_material_risk_count: number;
  requirement_contributions: unknown;
  audit_notes: unknown;
}

function asScore(row: ScoreRow): RepositoryScoreResult {
  return {
    policyVersion: row.policy_version,
    stage1Score: Number(row.stage1_score),
    repositoryEvidenceScore: Number(row.repository_evidence_score),
    repositoryCoverageAcrossJobRequirements: Number(row.repository_coverage_score),
    repositoryAdjustment: Number(row.repository_adjustment),
    combinedScore: Number(row.combined_score),
    assessedRequirementWeight: Number(row.assessed_requirement_weight),
    totalRequirementWeight: Number(row.total_requirement_weight),
    mandatoryCompleteNegativeCount: Number(row.mandatory_complete_negative_count),
    directClaimContradictionCount: Number(row.direct_claim_contradiction_count),
    observedMaterialRiskCount: Number(row.observed_material_risk_count),
    requirementContributions: Array.isArray(row.requirement_contributions)
      ? row.requirement_contributions as RepositoryScoreResult["requirementContributions"]
      : [],
    auditNotes: Array.isArray(row.audit_notes)
      ? row.audit_notes.map(String)
      : [],
  };
}

export async function maybeFinalizeRepositoryShortlist(
  jobId: string,
): Promise<string | null> {
  const db = getDb();
  const job = await db.query<{ closed_at: Date | null }>(
    `SELECT closed_at FROM jobs WHERE id = $1`,
    [jobId],
  );

  if (!job.rows[0]?.closed_at) return null;

  const state = await db.query<{ total: string; completed: string; failed: string }>(
    `
    SELECT
      COUNT(*)::text AS total,
      COUNT(*) FILTER (WHERE t.status = 'COMPLETED')::text AS completed,
      COUNT(*) FILTER (WHERE t.status IN ('FAILED', 'PENDING', 'RUNNING'))::text AS failed
    FROM application_tasks t
    JOIN job_applications ja ON ja.id = t.job_application_id
    WHERE ja.job_id = $1
      AND t.task_type = 'REPOSITORY_VERIFY'
    `,
    [jobId],
  );

  const total = Number(state.rows[0]?.total ?? 0);
  const completed = Number(state.rows[0]?.completed ?? 0);
  const incomplete = Number(state.rows[0]?.failed ?? 0);

  if (total === 0 || completed !== total || incomplete !== 0) return null;

  const rows = await db.query<ScoreRow>(
    `
    SELECT DISTINCT ON (t.job_application_id)
      t.job_application_id AS application_id,
      s.id AS score_run_id,
      s.policy_version,
      s.stage1_score,
      s.repository_evidence_score,
      s.repository_coverage_score,
      s.repository_adjustment,
      s.combined_score,
      s.assessed_requirement_weight,
      s.total_requirement_weight,
      s.mandatory_complete_negative_count,
      s.direct_claim_contradiction_count,
      s.observed_material_risk_count,
      s.requirement_contributions,
      s.audit_notes
    FROM application_tasks t
    JOIN job_applications ja ON ja.id = t.job_application_id
    JOIN application_repository_verifier_runs vr
      ON vr.id = (
        SELECT vr2.id
        FROM application_repository_verifier_runs vr2
        JOIN application_repository_analyses ra
          ON ra.id = vr2.application_repository_analysis_id
        JOIN application_tasks planner_task
          ON planner_task.id = ra.application_task_id
        WHERE planner_task.job_application_id = t.job_application_id
          AND planner_task.task_type = 'REPOSITORY_PLAN'
          AND vr2.status = 'COMPLETED'
        ORDER BY vr2.created_at DESC
        LIMIT 1
      )
    JOIN application_repository_score_runs s ON s.verifier_run_id = vr.id
    WHERE ja.job_id = $1
      AND t.task_type = 'REPOSITORY_VERIFY'
    ORDER BY t.job_application_id, s.created_at DESC
    `,
    [jobId],
  );

  if (rows.rows.length !== total) return null;

  const cohortHash = createHash("sha256")
    .update(rows.rows.map((row) => `${row.application_id}:${row.score_run_id}`).sort().join("|"))
    .digest("hex");

  const candidates: RankedRepositoryCandidate[] = rows.rows.map((row) => ({
    applicationId: row.application_id,
    score: asScore(row),
  }));

  const result = buildFinalInterviewShortlist(candidates);
  const recommended = new Set(result.automaticallyRecommended.map((row) => row.applicationId));
  const tieReview = new Set(result.evidenceEquivalentAtCutoff.map((row) => row.applicationId));
  const ordered = [
    ...result.automaticallyRecommended,
    ...result.evidenceEquivalentAtCutoff,
    ...result.notAutomaticallyRecommended,
  ];

  return withTransaction(async (client: PoolClient) => {
    const inserted = await client.query<{ id: string }>(
      `
      INSERT INTO repository_shortlist_runs (
        job_id, policy_version, scoring_mode, candidate_cohort_type,
        cohort_size, target_count, final_interview_rate,
        cohort_hash, cutoff_score, cutoff_tie_count
      ) VALUES ($1, $2, $3, 'CLOSED_JOB_TOP_PERCENT', $4, $5, $6, $7, $8, $9)
      ON CONFLICT (job_id, cohort_hash) DO NOTHING
      RETURNING id
      `,
      [
        jobId,
        REPOSITORY_SCORE_POLICY.version,
        REPOSITORY_SCORE_POLICY.mode,
        result.cohortSize,
        result.targetCount,
        REPOSITORY_SCORE_POLICY.finalInterviewRate,
        cohortHash,
        ordered[result.targetCount - 1]?.score.combinedScore ?? null,
        result.evidenceEquivalentAtCutoff.length,
      ],
    );

    if (!inserted.rows[0]) return null;

    const scoreRunByApplication = new Map(
      rows.rows.map((row) => [row.application_id, row.score_run_id]),
    );

    for (let index = 0; index < ordered.length; index += 1) {
      const candidate = ordered[index];
      if (!candidate) continue;
      const disposition = recommended.has(candidate.applicationId)
        ? "AUTOMATICALLY_RECOMMENDED"
        : tieReview.has(candidate.applicationId)
          ? "EVIDENCE_EQUIVALENT_AT_CUTOFF"
          : "NOT_AUTOMATICALLY_RECOMMENDED";

      await client.query(
        `
        INSERT INTO repository_shortlist_members (
          shortlist_run_id, application_id, score_run_id, rank,
          combined_score, repository_adjustment, disposition,
          tie_group_id, decision_reason
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
        [
          inserted.rows[0].id,
          candidate.applicationId,
          scoreRunByApplication.get(candidate.applicationId),
          index + 1,
          candidate.score.combinedScore,
          candidate.score.repositoryAdjustment,
          disposition,
          disposition === "EVIDENCE_EQUIVALENT_AT_CUTOFF" ? cohortHash : null,
          disposition === "EVIDENCE_EQUIVALENT_AT_CUTOFF"
            ? "Evidence-equivalent at the final interview cutoff"
            : null,
        ],
      );
    }

    return inserted.rows[0].id;
  });
}
