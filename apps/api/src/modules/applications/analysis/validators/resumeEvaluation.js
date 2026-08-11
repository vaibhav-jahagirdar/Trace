"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeAnalysisResponseSchema = void 0;
const zod_1 = require("zod");
const candidateExtraction_1 = require("./candidateExtraction");
const evaluationReport_1 = require("./evaluationReport");
exports.ResumeAnalysisResponseSchema = zod_1.z
    .object({
    candidate: candidateExtraction_1.CandidateExtractionOutputSchema,
    evaluation: evaluationReport_1.ResumeEvaluationReportLLMOutputSchema,
    raw_llm_response: zod_1.z.string().optional(),
})
    .strict();
//# sourceMappingURL=resumeEvaluation.js.map