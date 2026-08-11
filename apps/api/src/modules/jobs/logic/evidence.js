"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processEvidencePriorities = processEvidencePriorities;
const scoring_1 = require("../constants/scoring");
const errorHandler_1 = require("../../../middleware/errorHandler");
const scoring_2 = require("../constants/scoring");
async function processEvidencePriorities(role, evidencePriorities) {
    const totalWeight = scoring_2.EVALUATION_WEIGHT_POLICY.REQUIRED_TOTAL;
    let currentWeightSum = 0;
    if (evidencePriorities.length === 0) {
        throw new errorHandler_1.ValidationError("At least one evidence priority must be provided.");
    }
    const evaluationPolicy = scoring_1.JOB_ROLE_POLICY[role];
    const minDimensions = evaluationPolicy.minDimensions;
    const maxDimensions = evaluationPolicy.maxDimensions;
    const minWeight = scoring_2.EVALUATION_WEIGHT_POLICY.MIN_WEIGHT;
    const maxWeight = scoring_2.EVALUATION_WEIGHT_POLICY.MAX_WEIGHT;
    if (evidencePriorities.length < minDimensions || evidencePriorities.length > maxDimensions) {
        throw new errorHandler_1.ValidationError(`The number of evidence priorities must be between ${minDimensions} and ${maxDimensions} for role ${role}.`);
    }
    const evidenceIds = new Set();
    for (const priority of evidencePriorities) {
        if (evidenceIds.has(priority.evidence_category_id)) {
            throw new errorHandler_1.ValidationError(`Duplicate evidence category id ${priority.evidence_category_id} found.`);
        }
        evidenceIds.add(priority.evidence_category_id);
        if (priority.weight < minWeight || priority.weight > maxWeight) {
            throw new errorHandler_1.ValidationError(`Weight for evidence category id ${priority.evidence_category_id} must be between ${minWeight} and ${maxWeight}.`);
        }
        currentWeightSum += priority.weight;
    }
    if (currentWeightSum !== totalWeight) {
        throw new errorHandler_1.ValidationError(`The sum of weights for all evidence priorities must equal ${totalWeight}. Current sum is ${currentWeightSum}.`);
    }
    return evidencePriorities;
}
//# sourceMappingURL=evidence.js.map