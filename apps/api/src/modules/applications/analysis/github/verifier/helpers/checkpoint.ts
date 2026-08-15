import { PoolClient } from "pg";

export type VerifierRunStatus =
  | "PENDING"
  | "RETRIEVING"
  | "FILES_RETRIEVED"
  | "LLM_COMPLETED"
  | "COMPLETED"
  | "FAILED"
  | "QUARANTINED";

export interface VerifierCheckpoint {
  id: string;
  verifier_input_hash: string | null;
  raw_llm_response: string | null;
  cleaned_report: Record<string, unknown> | null;
  evidence_snapshot: Record<string, unknown> | null;
  status: VerifierRunStatus;
}

export async function beginVerifierRun(
  client: PoolClient,
  repositoryAnalysisId: string,
  inputHash: string,
  model: string,
  promptVersion: string,
): Promise<string> {
  const result = await client.query<{ id: string }>(
    `
    INSERT INTO application_repository_verifier_runs (
      application_repository_analysis_id,
      attempt,
      status,
      verifier_model,
      verifier_prompt_version,
      verifier_input_hash,
      started_at
    )
    SELECT id, COALESCE(
      (SELECT MAX(attempt) + 1
       FROM application_repository_verifier_runs r
       WHERE r.application_repository_analysis_id = a.id), 1),
      'RETRIEVING', $2, $3, $4, NOW()
    FROM application_repository_analyses a
    WHERE a.id = $1
    RETURNING id
    `,
    [repositoryAnalysisId, model, promptVersion, inputHash],
  );

  if (result.rowCount !== 1 || !result.rows[0]) {
    throw new Error(
      `Cannot create verifier run for repository analysis ${repositoryAnalysisId}`,
    );
  }

  return result.rows[0].id;
}

export async function checkpointVerifierResponse(
  client: PoolClient,
  runId: string,
  rawResponse: string,
  cleanedReport: Record<string, unknown>,
  evidenceSnapshot: Record<string, unknown>,
): Promise<void> {
  const result = await client.query(
    `
    UPDATE application_repository_verifier_runs
    SET raw_llm_response = $2,
        cleaned_report = $3::jsonb,
        evidence_snapshot = $4::jsonb,
        status = 'LLM_COMPLETED',
        llm_completed_at = NOW(),
        retrieval_completed_at = NOW(),
        updated_at = NOW()
    WHERE id = $1
    `,
    [
      runId,
      rawResponse,
      JSON.stringify(cleanedReport),
      JSON.stringify(evidenceSnapshot),
    ],
  );

  if (result.rowCount !== 1) {
    throw new Error(`Cannot checkpoint verifier run ${runId}`);
  }
}

export async function completeVerifierRun(
  client: PoolClient,
  runId: string,
  reportHash: string,
): Promise<void> {
  await client.query(
    `
    UPDATE application_repository_verifier_runs
    SET status = 'COMPLETED',
        verifier_report_hash = $2,
        completed_at = NOW(),
        updated_at = NOW()
    WHERE id = $1
    `,
    [runId, reportHash],
  );
}

export async function failVerifierRun(
  client: PoolClient,
  runId: string,
  error: unknown,
): Promise<void> {
  await client.query(
    `
    UPDATE application_repository_verifier_runs
    SET status = 'FAILED',
        error_message = LEFT($2, 4000),
        updated_at = NOW()
    WHERE id = $1
    `,
    [runId, error instanceof Error ? error.message : String(error)],
  );
}

export async function getVerifierCheckpoint(
  client: PoolClient,
  repositoryAnalysisId: string,
): Promise<VerifierCheckpoint | null> {
  const result = await client.query<VerifierCheckpoint>(
    `
    SELECT r.id, r.verifier_input_hash, r.raw_llm_response,
           r.cleaned_report, r.evidence_snapshot, r.status
    FROM application_repository_verifier_runs r
    JOIN application_repository_analyses a
      ON a.id = r.application_repository_analysis_id
    WHERE a.id = $1
    ORDER BY r.created_at DESC
    LIMIT 1
    `,
    [repositoryAnalysisId],
  );

  return result.rows[0] ?? null;
}
