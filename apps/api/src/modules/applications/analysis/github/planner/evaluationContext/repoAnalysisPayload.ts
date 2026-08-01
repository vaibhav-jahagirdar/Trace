import { application } from "express";
import { getDb } from "../../../../../../config/db";
import { getEvaluationContext } from "../../../../../jobs/services/[jobId]/evaluationContext";
import { getApplicationContext } from "../../../../[applicationId]/services/applicationContext.service";
interface RepositoryPlannerPayload {
  job_context: unknown; 
  candidate_context: unknown;
  stage_1: unknown; 
  github_url: string;
}

export class RepositoryPlannerContextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RepositoryPlannerContextError";
  }
}

async function getGithubUrl(jobApplicationId: string): Promise<string> {
  const { rows } = await getDb().query(
    `SELECT github_url
     FROM application_submissions
     WHERE job_application_id = $1`,
    [jobApplicationId],
  );

  const githubUrl = rows[0]?.github_url;
  if (!githubUrl) {
    throw new RepositoryPlannerContextError(
      `No github_url found for job_application_id=${jobApplicationId}`,
    );
  }
  return githubUrl;
}

async function getStage1Report(jobApplicationId: string): Promise<unknown> {
  const { rows } = await getDb().query(
    `SELECT rar.cleaned_response
     FROM resume_analysis_results rar
     JOIN application_tasks at ON at.id = rar.application_task_id
     WHERE at.job_application_id = $1
     ORDER BY rar.created_at DESC
     LIMIT 1`,
    [jobApplicationId],
  );

  const stage1 = rows[0]?.cleaned_response;
  if (!stage1) {
    throw new RepositoryPlannerContextError(
      `No Stage 1 resume analysis found for job_application_id=${jobApplicationId}. ` +
        `Stage 1 must complete before Stage 2A can run.`,
    );
  }
  return stage1;
}

export async function getRepositoryPlannerPayload(
  applicationId: string,
  jobId: string,
  taskId: string,
): Promise<RepositoryPlannerPayload> {
  const [jobContext,candidateContext,  githubUrl, stage1] = await Promise.all([
    getEvaluationContext(jobId),
    getApplicationContext(applicationId),
    getGithubUrl(applicationId),
    getStage1Report(taskId),
  ]);

  return {
    job_context: jobContext,
    candidate_context: candidateContext,
    stage_1: stage1,
    github_url: githubUrl,
  };
}