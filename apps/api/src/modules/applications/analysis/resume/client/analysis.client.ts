import { getResumeAnalysisPayload } from "../evaluationContext/contextBuilder.service";

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
) {
  const payload = await getResumeAnalysisPayload(
    applicationId,
    taskId,
  );

  const response = await fetch(
    `${ANALYSIS_SERVICE_URL}/resume/analyze`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");

    throw new AnalysisServiceError(
      `Analysis service returned ${response.status}`,
      response.status,
      body,
    );
  }

  return response.json();
}