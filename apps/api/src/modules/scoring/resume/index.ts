export {
  BASE_BUCKET_WEIGHTS,
  ROLE_FIT_CEILING,
  MANDATORY_GAP_CEILING,
  DEPTH_SCALE_MIN,
  DEPTH_SCALE_RANGE,
  EXPERIENCE_GAP_SOFT_PENALTY,
  EXPERIENCE_UNKNOWN_PENALTY,
  EDUCATION_GAP_SOFT_PENALTY,
  STAGE2_ADMISSION_RATE,
  DISQUALIFIED_LABEL,
  EVALUATION_PRIORITY_BUCKET_MAP,
} from './scoring.constants';

export type {
  PipelineStatus,
  EvaluationInput,
  JobContextInput,
  CandidateInput,
  BucketContribution,
  GateResult,
  ScoreResult,
  RankedCandidate,
  RankingReport,
} from './scoring.models';

export {
  getBucketScore,
  getRawSignals,
  flattenRequirementItems,
  looksLikeSubstitution,
  getClaimedYears,
  getHighestEducationLevel,
} from './scoring.models';

export { computeResumeScores } from './scoring.service';

export { rankAndAdmit } from './ranking.service';