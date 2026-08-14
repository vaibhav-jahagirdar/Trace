import { createHash } from "crypto";
import { PoolClient } from "pg";
import { withTransaction } from "../../../../../../config/transaction";
import { getDb } from "../../../../../../config/db";
import { planRepositories } from "../client/planner.client";
import { getRepositoryPlannerPayload } from "../evaluationContext/repoAnalysisPayload";
import { cleanPlannerResponse } from "../helpers/cleanPlannerOutput";
import { getPlannerCheckpoint, markPlannerLlmCompleted, markPlanningStarted, markPlanningFailed, markPlanningCompleted } from "../helpers/updatePlannerStatus";
import { persistRepositoryAnalysis } from "../helpers/persistPlanner";

const PLANNER_MODEL = process.env.LLM_MODEL ?? "deepseek-ai/deepseek-v4-flash";
const PLANNER_PROMPT_VERSION = process.env.REPOSITORY_PLANNER_PROMPT_VERSION ?? "v1";

async function inputHash(applicationId: string, jobId: string, taskId: string): Promise<string> {
  const payload = await getRepositoryPlannerPayload(applicationId, jobId, taskId);
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export async function repoPlanner(
  jobId: string,
  applicationId: string,
  taskId: string,
): Promise<void> {
  const hash = await inputHash(applicationId, jobId, taskId);
  const db = getDb();
  await withTransaction((client) => markPlanningStarted(client, taskId));
  const checkpoint = await getPlannerCheckpoint(db as unknown as PoolClient, taskId);
  let response;
  try {
    response = checkpoint?.planner_raw_output && checkpoint.planner_input_hash === hash
      ? await planRepositories(applicationId, jobId, taskId, JSON.stringify(checkpoint.planner_raw_output))
      : await planRepositories(applicationId, jobId, taskId);
    // Checkpoint the provider output before any cleaner or persistence logic.
    // A malformed/novel planner shape must never cause another LLM call.
    const rawResponse = typeof response.raw_llm_response === "string"
      ? response.raw_llm_response
      : JSON.stringify(response.raw_llm_response ?? response);
    let rawObject: unknown;
    try {
      rawObject = JSON.parse(rawResponse);
    } catch {
      rawObject = { raw: rawResponse };
    }
    await withTransaction((client) => markPlannerLlmCompleted(client, taskId, PLANNER_MODEL, PLANNER_PROMPT_VERSION, hash, rawObject as object));
    const cleaned = cleanPlannerResponse(response);
    await withTransaction(async (client) => {
      await persistRepositoryAnalysis(client, taskId, cleaned.plan as any, cleaned.repositoryDiscovery as any, PLANNER_MODEL, PLANNER_PROMPT_VERSION, hash, new Date());
      await markPlanningCompleted(client, taskId, cleaned.plan);
    });
  } catch (error) {
    await withTransaction((client) => markPlanningFailed(client, taskId, error));
    throw error;
  }
}
