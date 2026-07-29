import { PoolClient } from "pg";
import { createHash } from "crypto";
import { claimResumeParseTask } from "./helpers/validateCvAnalysisRequest";
import { analyzeResume } from "../client/analysis.client";
import {
  getCheckpoint,
  storeCheckpoint,
  getPermanentResult,
  storePermanentResult,
} from "./helpers/checkpoint";
import { getResumeAnalysisPayload } from "../evaluationContext/contextBuilder.service";
import { CandidateExtractionOutputSchema } from "../../validators/candidateExtraction";
import { ResumeEvaluationReportSchema } from "../../validators/evaluationReport";

async function computeRequestHash(applicationId: string, taskId: string): Promise<string> {
  const payload = await getResumeAnalysisPayload(applicationId, taskId);
  const json = JSON.stringify(payload, Object.keys(payload).sort());
  return createHash("sha256").update(json).digest("hex");
}

export async function resumeAnalysis(
  jobId: string,
  applicationId: string,
  taskId: string,
  client: PoolClient,
) {
  await claimResumeParseTask(client, taskId);

  const requestHash = await computeRequestHash(applicationId, taskId);
  const permanent = await getPermanentResult(client, taskId);
  let result;

  if (permanent && permanent.request_hash === requestHash) {
    result = await analyzeResume(applicationId, taskId, permanent.raw_llm_response);
  } else {
    const cachedRaw = await getCheckpoint(client, taskId);
    if (cachedRaw) {
      result = await analyzeResume(applicationId, taskId, cachedRaw);
    } else {
      result = await analyzeResume(applicationId, taskId);
    }

    if (result.raw_llm_response) {
      await storePermanentResult(client, taskId, requestHash, result.raw_llm_response);
      await storeCheckpoint(client, taskId, result.raw_llm_response);
    }
  }

  const { candidate, evaluation } = result;
  const validatedCandidate = CandidateExtractionOutputSchema.parse(candidate);
  const validatedEvaluation = ResumeEvaluationReportSchema.parse(evaluation);

  return {
    candidate: validatedCandidate,
    evaluation: validatedEvaluation,
  };
}