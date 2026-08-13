import { createHash } from "crypto";
import { getDb } from "../../../../../config/db";
import { withTransaction } from "../../../../../config/transaction";
import { analyzeResume } from "../client/analysis.client";
import {
  getCheckpoint,
  storeCheckpoint,
  getPermanentResult,
  storePermanentResult,
} from "./helpers/checkpoint";
import { PoolClient } from "pg";
import { getResumeAnalysisPayload } from "../evaluationContext/contextBuilder.service";
import { getEvaluationContext } from "../../../../jobs/services/[jobId]/evaluationContext";
import { CandidateExtractionOutputSchema } from "../../validators/candidateExtraction";
import { ResumeEvaluationReportLLMOutputSchema } from "../../validators/evaluationReport";
import { computeResumeScores } from "../../../../scoring/resume";
import type { ScoreResult } from "../../../../scoring/resume";
import { persistCandidateAnalysis } from "./helpers/persistCandidateAnalysis";
import { markTaskCompleted } from "./helpers/updateApplicationStatus";

export interface ResumeAnalysisResult {
  candidate: any;
  evaluation: any;
  scoreResult: ScoreResult;
}

async function computeRequestHash(applicationId: string, taskId: string): Promise<string> {
  const payload = await getResumeAnalysisPayload(applicationId, taskId);
  const json = JSON.stringify(payload, Object.keys(payload).sort());
  return createHash("sha256").update(json).digest("hex");
}

async function storeResumeAnalysisSummary(
  client: PoolClient,
  jobApplicationId: string,
  taskId: string,
  candidate: any,
  evaluation: any,
  scoreResult: ScoreResult,
): Promise<string> {
  await client.query(
    `UPDATE application_resume_analyses SET is_current = false WHERE job_application_id = $1 AND is_current = true`,
    [jobApplicationId],
  );

  const query = `
    INSERT INTO application_resume_analyses (
      job_application_id,
      application_task_id,
      prompt_version,
      model,
      extraction_confidence,
      scoring_confidence,
      overall_confidence,
      overall_role_fit,
      repository_priority,
      final_alignment_score,
      analysis_version,
      is_current,
      decision_critical_claims
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING id
  `;

  const promptVersion = candidate.metadata?.schema_version ?? "v6";
  const model = process.env.LLM_MODEL ?? "deepseek-ai/deepseek-v4-flash";
  const extractionConfidence = evaluation.confidence?.extraction_quality ?? "MEDIUM";
  const scoringConfidence = evaluation.confidence?.scoring_quality ?? "MEDIUM";
  const overallConfidence = evaluation.confidence?.overall ?? "MEDIUM";
  const overallRoleFit = evaluation.overall?.overall_role_fit ?? "MODERATE";
  const repositoryPriority = evaluation.overall?.repository_priority ?? "LOW";
  const finalScore = scoreResult.resume_match_score ?? 0;
  const decisionCriticalClaims = evaluation.decision_critical_claims ?? [];

  const values = [
    jobApplicationId,
    taskId,
    promptVersion,
    model,
    extractionConfidence,
    scoringConfidence,
    overallConfidence,
    overallRoleFit,
    repositoryPriority,
    finalScore,
    1,
    true,
    decisionCriticalClaims,
  ];

  const result = await client.query<{ id: string }>(query, values);
  if (result.rowCount === 0 || !result.rows[0]) {
    throw new Error("Failed to create resume analysis summary record");
  }
  return result.rows[0].id;
}

export async function resumeAnalysis(
  jobId: string,
  applicationId: string,
  taskId: string,
): Promise<ResumeAnalysisResult> {
  const startedAt = Date.now();
  console.log("[ResumeAnalysis][1] Starting", { jobId, applicationId, taskId });
  const requestHash = await computeRequestHash(applicationId, taskId);
  const db = getDb();

  const permanent = await getPermanentResult(db as any, taskId);
  console.log("[ResumeAnalysis][2] Cache lookup complete", { taskId, hasPermanent: Boolean(permanent) });
  let result;

  if (permanent && permanent.request_hash === requestHash) {
    result = await analyzeResume(applicationId, taskId, permanent.raw_llm_response);
  } else {
    const cachedRaw = await getCheckpoint(db as any, taskId);
    if (cachedRaw) {
      result = await analyzeResume(applicationId, taskId, cachedRaw);
    } else {
      result = await analyzeResume(applicationId, taskId);
    }
  }

  if (result.raw_llm_response) {
    await withTransaction(async (client) => {
      await storeCheckpoint(client, taskId, result.raw_llm_response!);
    });
    console.log("[ResumeAnalysis][2b] Raw LLM response checkpointed", {
      taskId,
      elapsedMs: Date.now() - startedAt,
    });
  }

  const { candidate, evaluation } = result;
  const validatedCandidate = CandidateExtractionOutputSchema.parse(candidate);
  // Python returns the model-owned Stage 1 report. Backend metadata and
  // computed_scores are produced here, not required from the LLM response.
  const validatedEvaluation = ResumeEvaluationReportLLMOutputSchema.parse(evaluation);

  const jobContext = await getEvaluationContext(jobId);
  console.log("[ResumeAnalysis][3] Job context loaded and response validated", { taskId });
  const scoreResult = computeResumeScores(
    jobContext as any,
    { candidate: validatedCandidate, evaluation: validatedEvaluation },
    applicationId,
  );
  console.log("[ResumeAnalysis][4] Resume score computed", {
    taskId,
    resumeMatchScore: scoreResult.resume_match_score,
    elapsedMs: Date.now() - startedAt,
  });

  const resumeAnalysisId = await withTransaction(async (client) => {
    if (result.raw_llm_response) {
      const cleanedResponse = { candidate: validatedCandidate, evaluation: validatedEvaluation };
      await storePermanentResult(client, taskId, requestHash, result.raw_llm_response, cleanedResponse);
      await storeCheckpoint(client, taskId, result.raw_llm_response);
    }
    const id = await storeResumeAnalysisSummary(client, applicationId, taskId, validatedCandidate, validatedEvaluation, scoreResult);
    await persistCandidateAnalysis(client, id, applicationId, validatedCandidate, validatedEvaluation);
    await markTaskCompleted(client, taskId);
    return id;
  });

  console.log("[ResumeAnalysis][5] Analysis persisted", { taskId, resumeAnalysisId, elapsedMs: Date.now() - startedAt });

  return {
    candidate: validatedCandidate,
    evaluation: validatedEvaluation,
    scoreResult,
  };
}
