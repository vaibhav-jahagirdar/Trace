import { PoolClient } from "pg";
import { REPOSITORY_SCORE_POLICY } from "../../../../../scoring/repository/repositoryScore.policy";
import { RepositoryScoreResult } from "../../../../../scoring/repository/repositoryScores.types";

export async function persistEvidenceUnits(
  client: PoolClient,
  verifierRunId: string,
  repositoryEvidence: Record<string, unknown>,
): Promise<void> {
  const repositories = Array.isArray(repositoryEvidence.repositories)
    ? repositoryEvidence.repositories
    : [];

  for (const repository of repositories) {
    if (!repository || typeof repository !== "object") continue;
    const repo = repository as Record<string, unknown>;
    const units = Array.isArray(repo.evidence_units)
      ? repo.evidence_units
      : [];

    for (const unit of units) {
      if (!unit || typeof unit !== "object") continue;
      const evidence = unit as Record<string, unknown>;

      await client.query(
        `
        INSERT INTO application_repository_evidence_units (
          verifier_run_id, evidence_id, repository_id, snapshot_ref,
          blob_sha, path, artifact_type, start_line, end_line,
          content, content_hash, retrieval_status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'RETRIEVED'
        )
        ON CONFLICT (verifier_run_id, evidence_id) DO UPDATE SET
          content = EXCLUDED.content,
          content_hash = EXCLUDED.content_hash,
          blob_sha = EXCLUDED.blob_sha
        `,
        [
          verifierRunId,
          String(evidence.evidence_id),
          String(repo.repository_id),
          String(repo.snapshot_ref ?? "UNKNOWN"),
          evidence.blob_sha ? String(evidence.blob_sha) : null,
          String(evidence.path),
          String(evidence.artifact_type ?? "UNKNOWN"),
          Number(evidence.start_line ?? 1),
          Number(evidence.end_line ?? 1),
          typeof evidence.content === "string" ? evidence.content : null,
          String(evidence.content_hash ?? ""),
        ],
      );
    }
  }
}

export async function persistRepositoryScoreRun(
  client: PoolClient,
  verifierRunId: string,
  analysisId: string,
  result: RepositoryScoreResult,
  scorerSourceRevision: string,
): Promise<string> {
  const inserted = await client.query<{ id: string }>(
    `
    INSERT INTO application_repository_score_runs (
      verifier_run_id,
      application_repository_analysis_id,
      policy_version,
      policy_snapshot,
      scorer_source_revision,
      stage1_score,
      repository_evidence_score,
      repository_coverage_score,
      repository_adjustment,
      combined_score,
      assessed_requirement_weight,
      total_requirement_weight,
      mandatory_complete_negative_count,
      direct_claim_contradiction_count,
      observed_material_risk_count,
      requirement_contributions,
      audit_notes,
      scoring_mode
    ) VALUES (
      $1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16::jsonb, $17::jsonb, $18
    )
    RETURNING id
    `,
    [
      verifierRunId,
      analysisId,
      result.policyVersion,
      JSON.stringify(REPOSITORY_SCORE_POLICY),
      scorerSourceRevision,
      result.stage1Score,
      result.repositoryEvidenceScore,
      result.repositoryCoverageAcrossJobRequirements,
      result.repositoryAdjustment,
      result.combinedScore,
      result.assessedRequirementWeight,
      result.totalRequirementWeight,
      result.mandatoryCompleteNegativeCount,
      result.directClaimContradictionCount,
      result.observedMaterialRiskCount,
      JSON.stringify(result.requirementContributions),
      JSON.stringify(result.auditNotes),
      REPOSITORY_SCORE_POLICY.mode,
    ],
  );

  if (inserted.rowCount !== 1 || !inserted.rows[0]) {
    throw new Error("Failed to persist repository score run");
  }

  return inserted.rows[0].id;
}
