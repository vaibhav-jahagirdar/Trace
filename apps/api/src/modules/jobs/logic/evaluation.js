"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processEvaluationPriorities = processEvaluationPriorities;
const scoring_1 = require("../constants/scoring");
const errorHandler_1 = require("../../../middleware/errorHandler");
function processEvaluationPriorities(role, evaluationPriorities) {
    const totalWeight = scoring_1.EVALUATION_WEIGHT_POLICY.REQUIRED_TOTAL;
    let currentWeightSum = 0;
    if (evaluationPriorities.length === 0) {
        throw new errorHandler_1.ValidationError("At least one evaluation priority must be provided.");
    }
    const evaluationPolicy = scoring_1.JOB_ROLE_POLICY[role];
    const minDimensions = evaluationPolicy.minDimensions;
    const maxDimensions = evaluationPolicy.maxDimensions;
    if (evaluationPriorities.length < minDimensions ||
        evaluationPriorities.length > maxDimensions) {
        throw new errorHandler_1.ValidationError(`The number of evaluation priorities must be between ${minDimensions} and ${maxDimensions} for role ${role}.`);
    }
    const evaluationIds = new Set();
    for (const priority of evaluationPriorities) {
        if (evaluationIds.has(priority.evaluation_dimension_id)) {
            throw new errorHandler_1.ValidationError(`Duplicate evaluation dimension id ${priority.evaluation_dimension_id} found.`);
        }
        evaluationIds.add(priority.evaluation_dimension_id);
        if (priority.weight < scoring_1.EVALUATION_WEIGHT_POLICY.MIN_WEIGHT ||
            priority.weight > scoring_1.EVALUATION_WEIGHT_POLICY.MAX_WEIGHT) {
            throw new errorHandler_1.ValidationError(`Weight for evaluation dimension id ${priority.evaluation_dimension_id} must be between ${scoring_1.EVALUATION_WEIGHT_POLICY.MIN_WEIGHT} and ${scoring_1.EVALUATION_WEIGHT_POLICY.MAX_WEIGHT}.`);
        }
        currentWeightSum += priority.weight;
    }
    if (currentWeightSum !== totalWeight) {
        throw new errorHandler_1.ValidationError(`The sum of weights for all evaluation priorities must equal ${totalWeight}. Current sum is ${currentWeightSum}.`);
    }
    return evaluationPriorities;
}
//# sourceMappingURL=evaluation.js.map