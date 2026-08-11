/**
 * All tunable constants for the Trace Stage-1 scoring engine.
 *
 * These values are derived from the "Final Production‑Grade Scoring Logic – Revised Document"
 * (Section 10: Summary of Constants). They should be modified only after careful review
 * of the scoring philosophy and downstream effects on candidate ranking.
 *
 * @module scoring.constants
 */
/**
 * Default weights for the six evidence buckets in the Layer 1 continuous score.
 * These reflect the relative importance of each evidence type as per the Trace
 * priority hierarchy (primary evidence > secondary > concepts/tech > signals).
 *
 * @see Final logic document §3.1
 */
export declare const BASE_BUCKET_WEIGHTS: Record<string, number>;
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
export declare const EVALUATION_PRIORITY_BUCKET_MAP: Record<string, readonly string[]>;
/**
 * Minimum scale factor applied to technical buckets when TECHNICAL_DEPTH weight is 0%.
 * This prevents a single dial from zeroing out the contribution of technical buckets.
 *
 * @see Final logic document §3.2
 */
export declare const DEPTH_SCALE_MIN = 0.85;
/**
 * Range of possible scale values. The actual scale is:
 *   scale = DEPTH_SCALE_MIN + DEPTH_SCALE_RANGE * (mappedWeight / totalWeight)
 * This yields a scale between DEPTH_SCALE_MIN and DEPTH_SCALE_MIN + DEPTH_SCALE_RANGE.
 */
export declare const DEPTH_SCALE_RANGE = 0.3;
/**
 * Maximum score allowed based on the LLM's overall_role_fit categorical band.
 * These ceilings are anchored to the upper bound of each rubric band's numeric range,
 * ensuring a band never permits a score that exceeds its own definition.
 *
 * @see Final logic document §4.1
 */
export declare const ROLE_FIT_CEILING: Record<string, number>;
/**
 * Maximum score allowed when any mandatory requirement (technology, concept, or
 * qualification) is MISSING or UNCONFIRMED without a documented substitution.
 * This is set to the top of the LOW band (54) per the Trace system prompt.
 *
 * @see Final logic document §4.2
 */
export declare const MANDATORY_GAP_CEILING = 54;
/**
 * Deduction applied when the candidate's claimed years of experience falls
 * outside the job's experienceYearsMin/Max range.
 *
 * @see Final logic document §5.1
 */
export declare const EXPERIENCE_GAP_SOFT_PENALTY = 6;
/**
 * Smaller deduction applied when the candidate omits their claimed total years
 * of experience entirely.
 */
export declare const EXPERIENCE_UNKNOWN_PENALTY = 3;
/**
 * Deduction applied when the candidate's highest recognised education level
 * falls below the job's minimumEducationLevel.
 *
 * @see Final logic document §5.2
 */
export declare const EDUCATION_GAP_SOFT_PENALTY = 8;
/**
 * Default proportion of the candidate pool to admit to Stage 2 (repository analysis).
 * Set to the midpoint of the stated 35-40% range.
 *
 * @see Final logic document §7
 */
export declare const STAGE2_ADMISSION_RATE = 0.375;
export declare const DISQUALIFIED_LABEL = "DISQUALIFIED_STRICT_TECHNOLOGY_MODE";
//# sourceMappingURL=scoring.constants.d.ts.map