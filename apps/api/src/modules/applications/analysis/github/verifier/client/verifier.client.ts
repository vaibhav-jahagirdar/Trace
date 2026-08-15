import { getRepositoryVerifierPayload } from "../evaluationContext/repoVerifierPayload";

const VERIFIER_SERVICE_URL =
  process.env.ANALYSIS_SERVICE_URL ?? "http://localhost:8000";

const VERIFIER_ENDPOINT =
  process.env.REPOSITORY_VERIFIER_ENDPOINT ??
  "/repository-verifier/verify";

export class RepositoryVerifierServiceError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "RepositoryVerifierServiceError";
  }
}

export interface RepositoryVerifierResponse {
  report: Record<string, unknown>;
  raw_llm_response?: string;
  repository_evidence?: Record<string, unknown>;
}

export async function verifyRepositories(
  applicationId: string,
  jobId: string,
  taskId: string,
  rawLlmResponse?: string,
  repositoryAnalysisId?: string,
): Promise<RepositoryVerifierResponse> {
  const startedAt = Date.now();

  console.log("[RepoVerifierClient][1] Building verifier payload", {
    applicationId,
    jobId,
    taskId,
  });

  const payload = await getRepositoryVerifierPayload(
    applicationId,
    jobId,
    repositoryAnalysisId,
  );

  if (rawLlmResponse) {
    (payload as unknown as Record<string, unknown>).raw_llm_response =
      rawLlmResponse;
  }

  const url = `${VERIFIER_SERVICE_URL}${VERIFIER_ENDPOINT}`;

  console.log("[RepoVerifierClient][2] Calling Python verifier", {
    taskId,
    url,
    fileCount: payload.repository_files.length,
    elapsedMs: Date.now() - startedAt,
  });

  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(
        Number(
          process.env.REPOSITORY_VERIFIER_TIMEOUT_MS ??
            process.env.ANALYSIS_SERVICE_TIMEOUT_MS ??
            300_000,
        ),
      ),
    });
  } catch (cause) {
    throw new RepositoryVerifierServiceError(
      "Repository verifier request failed",
      undefined,
      cause,
    );
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");

    console.error("[RepoVerifierClient][error] Python verifier failed", {
      taskId,
      status: response.status,
      body: body.slice(0, 2000),
      elapsedMs: Date.now() - startedAt,
    });

    throw new RepositoryVerifierServiceError(
      `Repository verifier returned ${response.status}: ${body.slice(0, 500)}`,
      response.status,
      body,
    );
  }

  console.log("[RepoVerifierClient][3] Verifier response received", {
    taskId,
    status: response.status,
    elapsedMs: Date.now() - startedAt,
  });

  let json: unknown;

  try {
    json = await response.json();
  } catch (cause) {
    throw new RepositoryVerifierServiceError(
      "Repository verifier returned invalid JSON",
      response.status,
      cause,
    );
  }

  if (!json || typeof json !== "object" || Array.isArray(json)) {
    throw new RepositoryVerifierServiceError(
      "Repository verifier returned a non-object response",
      response.status,
      json,
    );
  }

  const body = json as Record<string, unknown>;

  // The verifier prompt returns the report object directly.
  // Do not require Zod/schema validation here.
  const report =
    body.report && typeof body.report === "object"
      ? (body.report as Record<string, unknown>)
      : body;

  if (
    !Array.isArray(report.evidence_ledger) ||
    !Array.isArray(report.objective_coverage) ||
    !Array.isArray(report.engineering_cards) ||
    !Array.isArray(report.requirement_mappings) ||
    !Array.isArray(report.claim_verifications)
  ) {
    throw new RepositoryVerifierServiceError(
      "Repository verifier response is missing required report sections",
      response.status,
      body,
    );
  }

  console.log("[RepoVerifierClient][4] Verifier report accepted", {
    taskId,
    findingCount: report.evidence_ledger.length,
    objectiveCount: report.objective_coverage.length,
    cardCount: report.engineering_cards.length,
    requirementCount: report.requirement_mappings.length,
    claimCount: report.claim_verifications.length,
    elapsedMs: Date.now() - startedAt,
  });

const result: RepositoryVerifierResponse = {
  report,
};

const responseRawLlm = body.raw_llm_response;

if (typeof responseRawLlm === "string") {
  result.raw_llm_response = responseRawLlm;
}

const repositoryEvidence = body.repository_evidence;

if (
  repositoryEvidence &&
  typeof repositoryEvidence === "object" &&
  !Array.isArray(repositoryEvidence)
) {
  result.repository_evidence =
    repositoryEvidence as Record<string, unknown>;
}

return result;
}
