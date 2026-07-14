import { getResumeAnalysisPayload } from "../evaluationContext/contextBuilder.service";
import {
  ResumeAnalysisResponseSchema,
  ResumeAnalysisResponse,
} from "../../validators/resumeEvaluation";

const ANALYSIS_SERVICE_URL =
  process.env.ANALYSIS_SERVICE_URL ?? "http://localhost:8000";

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
): Promise<ResumeAnalysisResponse> {
  const payload = await getResumeAnalysisPayload(applicationId, taskId);

  const response = await fetch(`${ANALYSIS_SERVICE_URL}/resume/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new AnalysisServiceError(
      `Analysis service returned ${response.status}`,
      response.status,
      body,
    );
  }

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

  return parsed.data;
}