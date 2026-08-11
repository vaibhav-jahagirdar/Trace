"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisServiceError = void 0;
exports.analyzeResume = analyzeResume;
const contextBuilder_service_1 = require("../evaluationContext/contextBuilder.service");
const resumeEvaluation_1 = require("../../validators/resumeEvaluation");
const ANALYSIS_SERVICE_URL = process.env.ANALYSIS_SERVICE_URL ?? "http://localhost:8000";
class AnalysisServiceError extends Error {
    status;
    cause;
    constructor(message, status, cause) {
        super(message);
        this.status = status;
        this.cause = cause;
        this.name = "AnalysisServiceError";
    }
}
exports.AnalysisServiceError = AnalysisServiceError;
async function analyzeResume(applicationId, taskId, rawLlmResponse) {
    const payload = await (0, contextBuilder_service_1.getResumeAnalysisPayload)(applicationId, taskId);
    if (rawLlmResponse) {
        payload.raw_llm_response = rawLlmResponse;
    }
    const response = await fetch(`${ANALYSIS_SERVICE_URL}/resume/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new AnalysisServiceError(`Analysis service returned ${response.status}`, response.status, body);
    }
    let json;
    try {
        json = await response.json();
    }
    catch (err) {
        throw new AnalysisServiceError("Analysis service returned a response that was not valid JSON", response.status, err);
    }
    const parsed = resumeEvaluation_1.ResumeAnalysisResponseSchema.safeParse(json);
    if (!parsed.success) {
        throw new AnalysisServiceError("Analysis service response failed schema validation", response.status, parsed.error);
    }
    return {
        ...parsed.data,
        raw_llm_response: json.raw_llm_response,
    };
}
//# sourceMappingURL=analysis.client.js.map