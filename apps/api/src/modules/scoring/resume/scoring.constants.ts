// apps/api/src/modules/scoring/scoring.constants.ts

/**
 * All tunable constants for the Trace Stage-1 scoring engine.
 *
 * These values are derived from the "Final Production‑Grade Scoring Logic – Revised Document"
 * (Section 10: Summary of Constants). They should be modified only after careful review
 * of the scoring philosophy and downstream effects on candidate ranking.
 *
 * @module scoring.constants
 */

// ============================================================================
// Layer 1: Base bucket weights (must sum to 100)
// ============================================================================

/**
 * Default weights for the six evidence buckets in the Layer 1 continuous score.
 * These reflect the relative importance of each evidence type as per the Trace
 * priority hierarchy (primary evidence > secondary > concepts/tech > signals).
 *
 * @see Final logic document §3.1
 */
export const BASE_BUCKET_WEIGHTS: Record<string, number> = {
  primary_evidence: 35,
  secondary_evidence: 20,
  concept_alignment: 18,
  technology_alignment: 17,
  qualification_alignment: 2.5,
  supporting_signals: 7.5,
} as const;

// Runtime validation to ensure weights sum to 100
const sumWeights = Object.values(BASE_BUCKET_WEIGHTS).reduce((a, b) => a + b, 0);
if (Math.abs(sumWeights - 100) > 1e-6) {
  throw new Error(`BASE_BUCKET_WEIGHTS must sum to 100; currently ${sumWeights}`);
}

// ============================================================================
// evaluationPriorities mapping
// ============================================================================

/**
 * Mapping from evaluation priority codes (as found in job_context.evaluationPriorities)
 * to the list of bucket names they should influence.
 *
 * The scale factor derived from the `TECHNICAL_DEPTH` weight is applied to these
 * buckets to adjust their relative contribution. Priorities with no mapping
 * (e.g., COMMUNICATION) are excluded from Layer 1 entirely because they have no
 * scorable evidence buckets – Trace does not score prose polish/fluency.
 *
 * @see Final logic document §3.2
 */
export const EVALUATION_PRIORITY_BUCKET_MAP: Record<string, readonly string[]> = {
  TECHNICAL_DEPTH: ['technology_alignment', 'concept_alignment', 'primary_evidence'],
  // Add other codes as they appear in your job_context schema:
  // SYSTEM_DESIGN: ['primary_evidence', 'secondary_evidence'],
  // PROBLEM_SOLVING: ['primary_evidence', 'concept_alignment'],
} as const;

// ============================================================================
// Bounded scaling for evaluationPriorities
// ============================================================================

/**
 * Minimum scale factor applied to technical buckets when TECHNICAL_DEPTH weight is 0%.
 * This prevents a single dial from zeroing out the contribution of technical buckets.
 *
 * @see Final logic document §3.2
 */
export const DEPTH_SCALE_MIN = 0.85;

/**
 * Range of possible scale values. The actual scale is:
 *   scale = DEPTH_SCALE_MIN + DEPTH_SCALE_RANGE * (mappedWeight / totalWeight)
 * This yields a scale between DEPTH_SCALE_MIN and DEPTH_SCALE_MIN + DEPTH_SCALE_RANGE.
 */
export const DEPTH_SCALE_RANGE = 0.30;

// ============================================================================
// Layer 2: Role‑fit ceilings (rubric‑grounded)
// ============================================================================

/**
 * Maximum score allowed based on the LLM's overall_role_fit categorical band.
 * These ceilings are anchored to the upper bound of each rubric band's numeric range,
 * ensuring a band never permits a score that exceeds its own definition.
 *
 * @see Final logic document §4.1
 */
export const ROLE_FIT_CEILING: Record<string, number> = {
  EXCEPTIONAL: 100,
  STRONG: 89,
  GOOD: 74,
  MODERATE: 54,
  WEAK: 29,
  POOR: 14,
} as const;

// ============================================================================
// Mandatory‑gap ceiling (backend defence)
// ============================================================================

/**
 * Maximum score allowed when any mandatory requirement (technology, concept, or
 * qualification) is MISSING or UNCONFIRMED without a documented substitution.
 * This is set to the top of the LOW band (54) per the Trace system prompt.
 *
 * @see Final logic document §4.2
 */
export const MANDATORY_GAP_CEILING = 54;

// ============================================================================
// Soft penalties for experience & education
// ============================================================================

/**
 * Deduction applied when the candidate's claimed years of experience falls
 * outside the job's experienceYearsMin/Max range.
 *
 * @see Final logic document §5.1
 */
export const EXPERIENCE_GAP_SOFT_PENALTY = 6;

/**
 * Smaller deduction applied when the candidate omits their claimed total years
 * of experience entirely.
 */
export const EXPERIENCE_UNKNOWN_PENALTY = 3;

/**
 * Deduction applied when the candidate's highest recognised education level
 * falls below the job's minimumEducationLevel.
 *
 * @see Final logic document §5.2
 */
export const EDUCATION_GAP_SOFT_PENALTY = 8;

// ============================================================================
// Ranking & Stage‑2 admission
// ============================================================================

/**
 * Default proportion of the candidate pool to admit to Stage 2 (repository analysis).
 * Set to the midpoint of the stated 35-40% range.
 *
 * @see Final logic document §7
 */
export const STAGE2_ADMISSION_RATE = 0.375;


export const DISQUALIFIED_LABEL = 'DISQUALIFIED_STRICT_TECHNOLOGY_MODE';