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
import { getEvaluationContext } from "../../../../jobs/services/[jobId]/evaluationContext";
import { CandidateExtractionOutputSchema } from "../../validators/candidateExtraction";
import { ResumeEvaluationReportSchema } from "../../validators/evaluationReport";
import { computeResumeScores } from "../../../../scoring/resume";
import type { ScoreResult } from "../../../../scoring/resume";
import { persistCandidateAnalysis } from "./helpers/persistCandidateAnalysis";

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
  client: PoolClient,
): Promise<ResumeAnalysisResult> {
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
  }

  const { candidate, evaluation } = result;
  const validatedCandidate = CandidateExtractionOutputSchema.parse(candidate);
  const validatedEvaluation = ResumeEvaluationReportSchema.parse(evaluation);

  const jobContext = await getEvaluationContext(jobId);
  const scoreResult = computeResumeScores(
    jobContext as any,
    { candidate: validatedCandidate, evaluation: validatedEvaluation },
    applicationId,
  );

  if (result.raw_llm_response) {
    const cleanedResponse = {
      candidate: validatedCandidate,
      evaluation: validatedEvaluation,
    };
    await storePermanentResult(
      client,
      taskId,
      requestHash,
      result.raw_llm_response,
      cleanedResponse,
    );
    await storeCheckpoint(client, taskId, result.raw_llm_response);
  }

  const resumeAnalysisId = await storeResumeAnalysisSummary(
    client,
    applicationId,
    taskId,
    validatedCandidate,
    validatedEvaluation,
    scoreResult,
  );

  await persistCandidateAnalysis(
    client,
    resumeAnalysisId,
    applicationId,
    validatedCandidate,
    validatedEvaluation,
  );

  return {
    candidate: validatedCandidate,
    evaluation: validatedEvaluation,
    scoreResult,
  };
}