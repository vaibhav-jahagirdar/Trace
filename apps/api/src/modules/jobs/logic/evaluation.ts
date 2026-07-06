import {
  EVALUATION_WEIGHT_POLICY,
  JOB_ROLE_POLICY,
} from "../constants/scoring";
import { getDb } from "../../../config/db";
import { ValidationError } from "../../../middleware/errorHandler";
import type { JobEvaluationPrioritiesInput } from "../jobs.validator";
import { JobRole } from "../constants/jobPolicy";

export function processEvaluationPriorities(
  role: JobRole,
  evaluationPriorities: JobEvaluationPrioritiesInput,
) {
  const totalWeight = EVALUATION_WEIGHT_POLICY.REQUIRED_TOTAL;
  let currentWeightSum = 0;

  if (evaluationPriorities.length === 0) {
    throw new ValidationError(
      "At least one evaluation priority must be provided.",
    );
  }
  const evaluationPolicy = JOB_ROLE_POLICY[role];
  const minDimensions = evaluationPolicy.minDimensions;
  const maxDimensions = evaluationPolicy.maxDimensions;

  if (
    evaluationPriorities.length < minDimensions ||
    evaluationPriorities.length > maxDimensions
  ) {
    throw new ValidationError(
      `The number of evaluation priorities must be between ${minDimensions} and ${maxDimensions} for role ${role}.`,
    );
  }
  const evaluationIds = new Set<string>();

  for (const priority of evaluationPriorities) {
    if (evaluationIds.has(priority.evaluation_dimension_id)) {
      throw new ValidationError(
        `Duplicate evaluation dimension id ${priority.evaluation_dimension_id} found.`,
      );
    }
    evaluationIds.add(priority.evaluation_dimension_id);
    if (
      priority.weight < EVALUATION_WEIGHT_POLICY.MIN_WEIGHT ||
      priority.weight > EVALUATION_WEIGHT_POLICY.MAX_WEIGHT
    ) {
      throw new ValidationError(
        `Weight for evaluation dimension id ${priority.evaluation_dimension_id} must be between ${EVALUATION_WEIGHT_POLICY.MIN_WEIGHT} and ${EVALUATION_WEIGHT_POLICY.MAX_WEIGHT}.`,
      );
    }
    currentWeightSum += priority.weight;
  }
  if (currentWeightSum !== totalWeight) {
    throw new ValidationError(
      `The sum of weights for all evaluation priorities must equal ${totalWeight}. Current sum is ${currentWeightSum}.`,
    );
  }
  return evaluationPriorities;
}
