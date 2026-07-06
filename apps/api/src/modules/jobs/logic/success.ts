import { ValidationError } from "../../../middleware/errorHandler";
import {
  JOB_ROLE_SUCCESS_SIGNAL_POLICY,
  JobRole,
} from "../constants/jobPolicy";
import { EVALUATION_WEIGHT_POLICY } from "../constants/scoring";
import { JobSuccessSignalsInput } from "../jobs.validator";

export function processSuccessSignals(
  role: JobRole,
  successSignals: JobSuccessSignalsInput,
) {
  const totalWeight = EVALUATION_WEIGHT_POLICY.REQUIRED_TOTAL;
  let currentWeightSum = 0;

  if (successSignals.length === 0) {
    throw new ValidationError("At least one success signal must be provided.");
  }

  const successSignalIds = new Set<string>();
  const rolePolicy = JOB_ROLE_SUCCESS_SIGNAL_POLICY[role];
  const minDimensions = rolePolicy.minSelections;
  const maxDimensions = rolePolicy.maxSelections;
  if (
    successSignals.length < minDimensions ||
    successSignals.length > maxDimensions
  ) {
    throw new ValidationError(
      `The number of success signals must be between ${minDimensions} and ${maxDimensions} for role ${role}.`,
    );
  }
  for (const signal of successSignals) {
    if (successSignalIds.has(signal.success_signal_id)) {
      throw new ValidationError(
        `Duplicate success signal id ${signal.success_signal_id} found.`,
      );
    }
    successSignalIds.add(signal.success_signal_id);
    if (
      signal.weight < EVALUATION_WEIGHT_POLICY.MIN_WEIGHT ||
      signal.weight > EVALUATION_WEIGHT_POLICY.MAX_WEIGHT
    ) {
      throw new ValidationError(
        `Weight for success signal id ${signal.success_signal_id} must be between ${EVALUATION_WEIGHT_POLICY.MIN_WEIGHT} and ${EVALUATION_WEIGHT_POLICY.MAX_WEIGHT}.`,
      );
    }
    currentWeightSum += signal.weight;
  }
  if (currentWeightSum !== totalWeight) {
    throw new ValidationError(
      `The sum of weights for all success signals must equal ${totalWeight}. Current sum is ${currentWeightSum}.`,
    );
  }
}
