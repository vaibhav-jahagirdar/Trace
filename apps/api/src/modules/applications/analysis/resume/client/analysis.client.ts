import { Agent } from "undici";
import { getResumeAnalysisPayload } from "../evaluationContext/contextBuilder.service";
import {
  ResumeAnalysisResponseSchema,
  ResumeAnalysisResponse,
} from "../../validators/resumeEvaluation";

const ANALYSIS_SERVICE_URL =
  process.env.ANALYSIS_SERVICE_URL ?? "https://trace-analysis-esgjc2bmg0f8ecfp.westus3-01.azurewebsites.net";
const ANALYSIS_TIMEOUT_MS = Number(
  process.env.ANALYSIS_SERVICE_TIMEOUT_MS ?? 900_000,
);
const analysisDispatcher = new Agent({
  connectTimeout: 30_000,
  headersTimeout: ANALYSIS_TIMEOUT_MS,
  bodyTimeout: ANALYSIS_TIMEOUT_MS,
});

export class AnalysisServiceError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AnalysisServiceError";
  }
}

export async function analyzeResume(
 
  applicationId: string,
  taskId: string,
  rawLlmResponse?: string,
): Promise<ResumeAnalysisResponse & { raw_llm_response?: string }> {
  const startedAt = Date.now();
  console.log("[AnalysisClient][1] Building analysis payload", { applicationId, taskId });
  const payload = await getResumeAnalysisPayload(applicationId, taskId);
  console.log("[AnalysisClient][2] Calling Python analysis service", { taskId, url: `${ANALYSIS_SERVICE_URL}/resume/analyze`, elapsedMs: Date.now() - startedAt });

  if (rawLlmResponse) {
    (payload as any).raw_llm_response = rawLlmResponse;
  }

  const response = await fetch(`${ANALYSIS_SERVICE_URL}/resume/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(ANALYSIS_TIMEOUT_MS),
    dispatcher: analysisDispatcher,
  } as RequestInit & { dispatcher: Agent });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error("[AnalysisClient][error] Python analysis request failed", {
      taskId,
      status: response.status,
      body: body.slice(0, 2000),
      elapsedMs: Date.now() - startedAt,
    });
    throw new AnalysisServiceError(
      `Analysis service returned ${response.status}: ${body.slice(0, 500)}`,
      response.status,
      body,
    );
  }
  console.log("[AnalysisClient][3] Python analysis response received", { taskId, status: response.status, elapsedMs: Date.now() - startedAt });

  let json: unknown;
  try {
    json = await response.json();
  } catch (err) {
    throw new AnalysisServiceError(
      "Analysis service returned a response that was not valid JSON",
      response.status,
      err,
    );
  }

  const parsed = ResumeAnalysisResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new AnalysisServiceError(
      "Analysis service response failed schema validation",
      response.status,
      parsed.error,
    );
  }

  console.log("[AnalysisClient][4] Python response validated", { taskId, elapsedMs: Date.now() - startedAt });

  return {
    ...parsed.data,
    raw_llm_response: (json as any).raw_llm_response,
  };
}
