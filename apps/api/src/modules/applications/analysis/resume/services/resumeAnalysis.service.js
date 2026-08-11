"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumeAnalysis = resumeAnalysis;
const crypto_1 = require("crypto");
const validateCvAnalysisRequest_1 = require("./helpers/validateCvAnalysisRequest");
const analysis_client_1 = require("../client/analysis.client");
const checkpoint_1 = require("./helpers/checkpoint");
const contextBuilder_service_1 = require("../evaluationContext/contextBuilder.service");
const evaluationContext_1 = require("../../../../jobs/services/[jobId]/evaluationContext");
const candidateExtraction_1 = require("../../validators/candidateExtraction");
const evaluationReport_1 = require("../../validators/evaluationReport");
const resume_1 = require("../../../../scoring/resume");
const persistCandidateAnalysis_1 = require("./helpers/persistCandidateAnalysis");
async function computeRequestHash(applicationId, taskId) {
    const payload = await (0, contextBuilder_service_1.getResumeAnalysisPayload)(applicationId, taskId);
    const json = JSON.stringify(payload, Object.keys(payload).sort());
    return (0, crypto_1.createHash)("sha256").update(json).digest("hex");
}
async function storeResumeAnalysisSummary(client, jobApplicationId, taskId, candidate, evaluation, scoreResult) {
    await client.query(`UPDATE application_resume_analyses SET is_current = false WHERE job_application_id = $1 AND is_current = true`, [jobApplicationId]);
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
    const result = await client.query(query, values);
    if (result.rowCount === 0 || !result.rows[0]) {
        throw new Error("Failed to create resume analysis summary record");
    }
    return result.rows[0].id;
}
async function resumeAnalysis(jobId, applicationId, taskId, client) {
    await (0, validateCvAnalysisRequest_1.claimResumeParseTask)(client, taskId);
    const requestHash = await computeRequestHash(applicationId, taskId);
    const permanent = await (0, checkpoint_1.getPermanentResult)(client, taskId);
    let result;
    if (permanent && permanent.request_hash === requestHash) {
        result = await (0, analysis_client_1.analyzeResume)(applicationId, taskId, permanent.raw_llm_response);
    }
    else {
        const cachedRaw = await (0, checkpoint_1.getCheckpoint)(client, taskId);
        if (cachedRaw) {
            result = await (0, analysis_client_1.analyzeResume)(applicationId, taskId, cachedRaw);
        }
        else {
            result = await (0, analysis_client_1.analyzeResume)(applicationId, taskId);
        }
    }
    const { candidate, evaluation } = result;
    const validatedCandidate = candidateExtraction_1.CandidateExtractionOutputSchema.parse(candidate);
    const validatedEvaluation = evaluationReport_1.ResumeEvaluationReportSchema.parse(evaluation);
    const jobContext = await (0, evaluationContext_1.getEvaluationContext)(jobId);
    const scoreResult = (0, resume_1.computeResumeScores)(jobContext, { candidate: validatedCandidate, evaluation: validatedEvaluation }, applicationId);
    if (result.raw_llm_response) {
        const cleanedResponse = {
            candidate: validatedCandidate,
            evaluation: validatedEvaluation,
        };
        await (0, checkpoint_1.storePermanentResult)(client, taskId, requestHash, result.raw_llm_response, cleanedResponse);
        await (0, checkpoint_1.storeCheckpoint)(client, taskId, result.raw_llm_response);
    }
    const resumeAnalysisId = await storeResumeAnalysisSummary(client, applicationId, taskId, validatedCandidate, validatedEvaluation, scoreResult);
    await (0, persistCandidateAnalysis_1.persistCandidateAnalysis)(client, resumeAnalysisId, applicationId, validatedCandidate, validatedEvaluation);
    return {
        candidate: validatedCandidate,
        evaluation: validatedEvaluation,
        scoreResult,
    };
}
//# sourceMappingURL=resumeAnalysis.service.js.map