"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processSuccessSignals = processSuccessSignals;
const errorHandler_1 = require("../../../middleware/errorHandler");
const jobPolicy_1 = require("../constants/jobPolicy");
const scoring_1 = require("../constants/scoring");
function processSuccessSignals(role, successSignals) {
    const totalWeight = scoring_1.EVALUATION_WEIGHT_POLICY.REQUIRED_TOTAL;
    let currentWeightSum = 0;
    if (successSignals.length === 0) {
        throw new errorHandler_1.ValidationError("At least one success signal must be provided.");
    }
    const successSignalIds = new Set();
    const rolePolicy = jobPolicy_1.JOB_ROLE_SUCCESS_SIGNAL_POLICY[role];
    const minDimensions = rolePolicy.minSelections;
    const maxDimensions = rolePolicy.maxSelections;
    if (successSignals.length < minDimensions ||
        successSignals.length > maxDimensions) {
        throw new errorHandler_1.ValidationError(`The number of success signals must be between ${minDimensions} and ${maxDimensions} for role ${role}.`);
    }
    for (const signal of successSignals) {
        if (successSignalIds.has(signal.success_signal_id)) {
            throw new errorHandler_1.ValidationError(`Duplicate success signal id ${signal.success_signal_id} found.`);
        }
        successSignalIds.add(signal.success_signal_id);
        if (signal.weight < scoring_1.EVALUATION_WEIGHT_POLICY.MIN_WEIGHT ||
            signal.weight > scoring_1.EVALUATION_WEIGHT_POLICY.MAX_WEIGHT) {
            throw new errorHandler_1.ValidationError(`Weight for success signal id ${signal.success_signal_id} must be between ${scoring_1.EVALUATION_WEIGHT_POLICY.MIN_WEIGHT} and ${scoring_1.EVALUATION_WEIGHT_POLICY.MAX_WEIGHT}.`);
        }
        currentWeightSum += signal.weight;
    }
    if (currentWeightSum !== totalWeight) {
        throw new errorHandler_1.ValidationError(`The sum of weights for all success signals must equal ${totalWeight}. Current sum is ${currentWeightSum}.`);
    }
}
//# sourceMappingURL=success.js.map