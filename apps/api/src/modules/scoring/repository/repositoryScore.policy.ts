export const REPOSITORY_SCORE_POLICY = {
  version: "repository-v3-raised-bar-shadow",

  // Stage 2C is the primary engineering signal. Stage 1 remains a
  // job-fit/claim context signal and is never discarded.
  repositoryEvidenceWeight: 0.75,
  stage1Weight: 0.25,

  completeCoverageThreshold: 90,

  mode: "SHADOW" as "SHADOW" | "ACTIVE",
  finalInterviewRate: 0.10,
} as const;
