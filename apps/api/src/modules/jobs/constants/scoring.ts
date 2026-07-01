
export const PRIORITY_TYPES = {
  MANDATORY: "MANDATORY",
  PREFERRED: "PREFERRED",
  BONUS: "BONUS",
} as const;

export type PriorityType = keyof typeof PRIORITY_TYPES;

