"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEvaluationContext = getEvaluationContext;
const transaction_1 = require("../../../../config/transaction");
const getJobForEvaluation_1 = require("../helpers/getJobForEvaluation");
const getJobRequirement_1 = require("../helpers/getJobRequirement");
const getJobEvaluationPriorities_1 = require("../helpers/getJobEvaluationPriorities");
const getJobEvidencePriorities_1 = require("../helpers/getJobEvidencePriorities");
const getJobSuccessSignals_1 = require("../helpers/getJobSuccessSignals");
const toEvaluationContextDto_1 = require("../helpers/toEvaluationContextDto");
async function getEvaluationContext(jobId) {
    return (0, transaction_1.withTransaction)(async (client) => {
        const job = await (0, getJobForEvaluation_1.getJobForEvaluation)(client, jobId);
        const [requirements, evaluationPriorities, evidencePriorities, successSignals] = await Promise.all([
            (0, getJobRequirement_1.getJobRequirements)(client, jobId),
            (0, getJobEvaluationPriorities_1.getJobEvaluationPriorities)(client, jobId),
            (0, getJobEvidencePriorities_1.getJobEvidencePriorities)(client, jobId),
            (0, getJobSuccessSignals_1.getJobSuccessSignals)(client, jobId),
        ]);
        return (0, toEvaluationContextDto_1.toEvaluationContextDto)(job, requirements, evaluationPriorities, evidencePriorities, successSignals);
    });
}
//# sourceMappingURL=evaluationContext.js.map