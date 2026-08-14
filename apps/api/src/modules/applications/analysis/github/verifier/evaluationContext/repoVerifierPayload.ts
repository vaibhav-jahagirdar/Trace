import { getDb } from "../../../../../../config/db";
import { getEvaluationContext } from "../../../../../jobs/services/[jobId]/evaluationContext";
import { getApplicationContext } from "../../../../[applicationId]/services/applicationContext.service";

export interface RepositoryVerifierPayload {
  evaluation_context: {
    job_context: unknown;
    candidate_context: unknown;
  };
  stage_1_report: unknown;
  stage_2a_report: unknown;
  repository_files: Array<{
    repository_id: string;
    repository_url: string;
    owner: string;
    repository_name: string;
    ref: string;
    objective_id: string;
    path: string;
    file_url: string;
    blob_url: string;
    path_type: "FILE" | "DIRECTORY";
  }>;
}

export class RepositoryVerifierContextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RepositoryVerifierContextError";
  }
}

async function getStage1Report(jobApplicationId: string): Promise<unknown> {
  const { rows } = await getDb().query(
    `
    SELECT rar.cleaned_response
    FROM resume_analysis_results rar
    JOIN application_tasks at
      ON at.id = rar.application_task_id
    WHERE at.job_application_id = $1
    ORDER BY rar.created_at DESC
    LIMIT 1
    `,
    [jobApplicationId],
  );

  if (!rows[0]?.cleaned_response) {
    throw new RepositoryVerifierContextError(
      `No completed Stage 1 report found for job_application_id=${jobApplicationId}`,
    );
  }

  return rows[0].cleaned_response;
}

async function getStage2AReport(taskId: string): Promise<unknown> {
  const { rows } = await getDb().query(
    `
    SELECT planner_output
    FROM application_repository_analyses
    WHERE application_task_id = $1
      AND planning_status = 'COMPLETED'
    LIMIT 1
    `,
    [taskId],
  );

  if (!rows[0]?.planner_output) {
    throw new RepositoryVerifierContextError(
      `No completed Stage 2A report found for task_id=${taskId}`,
    );
  }

  return rows[0].planner_output;
}

async function getRepositoryFiles(
  taskId: string,
): Promise<RepositoryVerifierPayload["repository_files"]> {
  const { rows } = await getDb().query(
    `
    SELECT
      ar.github_repository_id,
      ar.repository_url,
      ar.owner,
      ar.repository_name,
      ar.default_branch,
      aro.planner_objective_id,
      arp.repository_path,
      arp.path_type
    FROM application_repository_analyses ara
    JOIN application_repositories ar
      ON ar.application_repository_analysis_id = ara.id
    JOIN application_repository_objectives aro
      ON aro.application_repository_id = ar.id
    JOIN application_repository_paths arp
      ON arp.application_repository_objective_id = aro.id
    WHERE ara.application_task_id = $1
      AND ar.retrieval_disposition IN ('ANALYZE', 'EXPLORE')
      AND arp.path_type = 'FILE'
    ORDER BY
      ar.repository_name,
      aro.objective_order,
      arp.repository_path
    `,
    [taskId],
  );

  if (rows.length === 0) {
    throw new RepositoryVerifierContextError(
      `No planner-selected files found for task_id=${taskId}`,
    );
  }

  const seen = new Set<string>();
  const files: RepositoryVerifierPayload["repository_files"] = [];

  for (const row of rows) {
    const key = `${row.github_repository_id}:${row.repository_path}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);

    const ref = row.default_branch;
    const encodedPath = row.repository_path
      .split("/")
      .map(encodeURIComponent)
      .join("/");

    files.push({
      repository_id: String(row.github_repository_id),
      repository_url: row.repository_url,
      owner: row.owner,
      repository_name: row.repository_name,
      ref,
      objective_id: row.planner_objective_id,
      path: row.repository_path,
      file_url:
        `https://api.github.com/repos/${row.owner}/${row.repository_name}` +
        `/contents/${encodedPath}?ref=${encodeURIComponent(ref)}`,
      blob_url:
        `https://github.com/${row.owner}/${row.repository_name}` +
        `/blob/${encodeURIComponent(ref)}/${encodedPath}`,
      path_type: row.path_type,
    });
  }

  return files;
}

export async function getRepositoryVerifierPayload(
  applicationId: string,
  jobId: string,
  taskId: string,
): Promise<RepositoryVerifierPayload> {
  const [
    jobContext,
    candidateContext,
    stage1Report,
    stage2AReport,
    repositoryFiles,
  ] = await Promise.all([
    getEvaluationContext(jobId),
    getApplicationContext(applicationId),
    getStage1Report(applicationId),
    getStage2AReport(taskId),
    getRepositoryFiles(taskId),
  ]);

  return {
    evaluation_context: {
      job_context: jobContext,
      candidate_context: candidateContext,
    },
    stage_1_report: stage1Report,
    stage_2a_report: stage2AReport,
    repository_files: repositoryFiles,
  };
}