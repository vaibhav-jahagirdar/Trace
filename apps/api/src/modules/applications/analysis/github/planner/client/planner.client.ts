import { Agent } from "undici";
import { getRepositoryPlannerPayload } from "../evaluationContext/repoAnalysisPayload";

const PLANNER_SERVICE_URL = process.env.ANALYSIS_SERVICE_URL ?? "http://localhost:8000";
const PLANNER_TIMEOUT_MS = Number(
  process.env.ANALYSIS_SERVICE_TIMEOUT_MS ?? 900_000,
);

const plannerDispatcher = new Agent({
  connectTimeout: 30_000,
  headersTimeout: PLANNER_TIMEOUT_MS,
  bodyTimeout: PLANNER_TIMEOUT_MS,
});

export class RepositoryPlannerServiceError extends Error {
  constructor(message: string, public readonly status?: number, public readonly cause?: unknown) {
    super(message);
    this.name = "RepositoryPlannerServiceError";
  }
}

export interface RepositoryPlannerResponse {
  plan: Record<string, unknown>;
  repository_discovery: Record<string, unknown>;
  raw_llm_response: string;
}

export async function planRepositories(
  applicationId: string,
  jobId: string,
  taskId: string,
  rawLlmResponse?: string,
): Promise<RepositoryPlannerResponse> {
  const startedAt = Date.now();
  const payload = await getRepositoryPlannerPayload(applicationId, jobId, taskId);
  if (rawLlmResponse) (payload as unknown as Record<string, unknown>).raw_llm_response = rawLlmResponse;
  console.log("[RepoPlannerClient][1] Calling Python planner", { taskId, url: `${PLANNER_SERVICE_URL}/repository-planner/plan` });

  const response = await fetch(`${PLANNER_SERVICE_URL}/repository-planner/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(PLANNER_TIMEOUT_MS),
    dispatcher: plannerDispatcher,
  } as RequestInit & { dispatcher: Agent });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new RepositoryPlannerServiceError(`Repository planner returned ${response.status}: ${body.slice(0, 500)}`, response.status, body);
  }
  const json = await response.json().catch((cause) => {
    throw new RepositoryPlannerServiceError("Repository planner returned invalid JSON", response.status, cause);
  }) as Record<string, unknown>;
  if (!json.plan || !json.repository_discovery || typeof json.raw_llm_response !== "string") {
    throw new RepositoryPlannerServiceError("Repository planner response is missing plan, discovery, or raw_llm_response", response.status, json);
  }
  console.log("[RepoPlannerClient][2] Planner response received", { taskId, elapsedMs: Date.now() - startedAt });
  return {
    plan: json.plan as Record<string, unknown>,
    repository_discovery: json.repository_discovery as Record<string, unknown>,
    raw_llm_response: json.raw_llm_response,
  };
}
