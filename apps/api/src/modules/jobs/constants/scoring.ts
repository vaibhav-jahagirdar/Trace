
export const PRIORITY_TYPES = {
  MANDATORY: "MANDATORY",
  PREFERRED: "PREFERRED",
  BONUS: "BONUS",
} as const;

export type PriorityType = keyof typeof PRIORITY_TYPES;

export const JOB_ROLE_EVALUATION_POLICY = {
  INTERN: {
    minDimensions: 3,
    maxDimensions: 5,
  },

  FRESHER: {
    minDimensions: 4,
    maxDimensions: 6,
  },

  JUNIOR: {
    minDimensions: 5,
    maxDimensions: 7,
  },

  MID: {
    minDimensions: 6,
    maxDimensions: 8,
  },

  SENIOR: {
    minDimensions: 7,
    maxDimensions: 9,
  },

  STAFF: {
    minDimensions: 8,
    maxDimensions: 10,
  },

  PRINCIPAL: {
    minDimensions: 8,
    maxDimensions: 10,
  },
} as const;
export const EVALUATION_WEIGHT_POLICY = {
  MIN_WEIGHT: 1,
  MAX_WEIGHT: 100,
  REQUIRED_TOTAL: 100,
} as const;

export type EvaluationWeightPolicy = typeof EVALUATION_WEIGHT_POLICY;
export type JobRoleEvaluationPolicy = typeof JOB_ROLE_EVALUATION_POLICY;

