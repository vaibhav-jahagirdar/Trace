import { z } from "zod";

export const ClaimIdSchema = z
  .string()
  .regex(/^claim_\d{4}$/, "claim_id must match ^claim_\\d{4}$");
export type ClaimId = z.infer<typeof ClaimIdSchema>;

export const RatingSchema = z.enum([
  "VERY_LOW",
  "LOW",
  "MEDIUM",
  "HIGH",
  "VERY_HIGH",
  "UNDETERMINABLE",
]);
export type Rating = z.infer<typeof RatingSchema>;

export const ConfidenceSchema = z.enum(["HIGH", "MEDIUM", "LOW"]);
export type Confidence = z.infer<typeof ConfidenceSchema>;

export const PriorityTypeSchema = z.enum(["MANDATORY", "PREFERRED", "BONUS"]);
export type PriorityType = z.infer<typeof PriorityTypeSchema>;

export const RequirementStatusSchema = z.enum(["CONFIRMED", "UNCONFIRMED", "MISSING"]);
export type RequirementStatus = z.infer<typeof RequirementStatusSchema>;

export const ClaimTypeSchema = z.enum([
  "RESPONSIBILITY",
  "ACHIEVEMENT",
  "IMPLEMENTATION",
  "ARCHITECTURAL",
  "MAJOR_FEATURE",
]);
export type ClaimType = z.infer<typeof ClaimTypeSchema>;

export const ImportanceSchema = z.enum(["CRITICAL", "HIGH", "MEDIUM"]);
export type Importance = z.infer<typeof ImportanceSchema>;

export const ExperienceSourceSchema = z.enum(["WORK", "PROJECT"]);
export type ExperienceSource = z.infer<typeof ExperienceSourceSchema>;

export const AlignmentRatingSchema = z.enum(["HIGH", "MEDIUM", "LOW", "UNDETERMINABLE"]);
export type AlignmentRating = z.infer<typeof AlignmentRatingSchema>;

export const OverallRoleFitSchema = z.enum([
  "EXCEPTIONAL",
  "STRONG",
  "GOOD",
  "MODERATE",
  "WEAK",
  "POOR",
]);
export type OverallRoleFit = z.infer<typeof OverallRoleFitSchema>;

export const RepositoryPrioritySchema = z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]);
export type RepositoryPriority = z.infer<typeof RepositoryPrioritySchema>;

export const ImpactSchema = z.enum(["HIGH", "MEDIUM", "LOW"]);
export type Impact = z.infer<typeof ImpactSchema>;

function wordCount(v: string): number {
  return v.trim() === "" ? 0 : v.trim().split(/\s+/).length;
}

function maxWords(maxWordsAllowed: number, fieldLabel?: string) {
  return (v: string, ctx: z.RefinementCtx) => {
    const n = wordCount(v);
    if (v && n > maxWordsAllowed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${fieldLabel ?? "value"} must be \u2264 ${maxWordsAllowed} words, got ${n}`,
      });
    }
  };
}

export const ScoredFieldSchema = z
  .object({
    rating: RatingSchema,
    score: z.number().int().min(0).max(100).nullable().optional().default(null),
    confidence: ConfidenceSchema,
    summary: z.string(),
    supporting_claim_ids: z.array(ClaimIdSchema).default([]),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.rating === "UNDETERMINABLE") {
      if (data.score !== null && data.score !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "score must be null when rating is UNDETERMINABLE",
          path: ["score"],
        });
      }
      if (data.supporting_claim_ids.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "supporting_claim_ids must be empty when rating is UNDETERMINABLE",
          path: ["supporting_claim_ids"],
        });
      }
    } else if (data.score === null || data.score === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "score is required unless rating is UNDETERMINABLE",
        path: ["score"],
      });
    }
  });
export type ScoredField = z.infer<typeof ScoredFieldSchema>;

// ---------------------------------------------------------------------------
// ScoreRating — pydantic: score/rating/confidence(optional)/
// supporting_claim_ids. Only checks the UNDETERMINABLE <=> score-null rule.
// ---------------------------------------------------------------------------

export const ScoreRatingSchema = z
  .object({
    score: z.number().int().min(0).max(100).nullable().optional().default(null),
    rating: RatingSchema,
    confidence: ConfidenceSchema.nullable().optional().default(null),
    supporting_claim_ids: z.array(ClaimIdSchema).default([]),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.rating === "UNDETERMINABLE" && data.score !== null && data.score !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "score must be null when rating is UNDETERMINABLE",
        path: ["score"],
      });
    }
    if (data.rating !== "UNDETERMINABLE" && (data.score === null || data.score === undefined)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "score is required unless rating is UNDETERMINABLE",
        path: ["score"],
      });
    }
  });
export type ScoreRating = z.infer<typeof ScoreRatingSchema>;

// ---------------------------------------------------------------------------
// DualAxisScoredField — pydantic: source_type/relevance(ScoreRating)/
// quality(ScoreRating)/score/rating/confidence/summary/supporting_claim_ids.
// relevance.rating and quality.rating must agree on UNDETERMINABLE-ness;
// when both UNDETERMINABLE, rating/score/supporting_claim_ids must reflect
// that; otherwise rating cannot be UNDETERMINABLE and score is required.
// ---------------------------------------------------------------------------

export const DualAxisScoredFieldSchema = z
  .object({
    source_type: ExperienceSourceSchema,
    relevance: ScoreRatingSchema,
    quality: ScoreRatingSchema,
    score: z.number().int().min(0).max(100).nullable().optional().default(null),
    rating: RatingSchema,
    confidence: ConfidenceSchema,
    summary: z.string(),
    supporting_claim_ids: z.array(ClaimIdSchema).default([]),
  })
  .strict()
  .superRefine((data, ctx) => {
    const relevanceUnd = data.relevance.rating === "UNDETERMINABLE";
    const qualityUnd = data.quality.rating === "UNDETERMINABLE";

    if (relevanceUnd !== qualityUnd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "relevance and quality must both be UNDETERMINABLE or both be scored",
        path: ["quality", "rating"],
      });
      return;
    }

    if (relevanceUnd) {
      if (data.rating !== "UNDETERMINABLE") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "rating must be UNDETERMINABLE when both axes are UNDETERMINABLE",
          path: ["rating"],
        });
      }
      if (data.score !== null && data.score !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "score must be null when axes are UNDETERMINABLE",
          path: ["score"],
        });
      }
      if (data.supporting_claim_ids.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "supporting_claim_ids must be empty when axes are UNDETERMINABLE",
          path: ["supporting_claim_ids"],
        });
      }
    } else {
      if (data.rating === "UNDETERMINABLE") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "rating cannot be UNDETERMINABLE when axes are scored",
          path: ["rating"],
        });
      }
      if (data.score === null || data.score === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "score is required when axes are scored",
          path: ["score"],
        });
      }
    }
  });
export type DualAxisScoredField = z.infer<typeof DualAxisScoredFieldSchema>;

export const TechnologyAlignmentSchema = ScoredFieldSchema.and(
  z.object({ mandatory_technologies_present: z.boolean() }).strict()
);
export type TechnologyAlignment = z.infer<typeof TechnologyAlignmentSchema>;

// pydantic QualificationAlignment — previously missing from the TS file.
export const QualificationAlignmentSchema = ScoredFieldSchema.and(
  z.object({ mandatory_qualifications_present: z.boolean() }).strict()
);
export type QualificationAlignment = z.infer<typeof QualificationAlignmentSchema>;

// pydantic SupportingSignalItem — code/priority_type/rating/score/note/
// supporting_claim_ids. No `confidence` field (unlike the old RubricItem).
export const SupportingSignalItemSchema = z
  .object({
    code: z.string(),
    priority_type: PriorityTypeSchema,
    rating: RatingSchema,
    score: z.number().int().min(0).max(100).nullable().optional().default(null),
    note: z.string(),
    supporting_claim_ids: z.array(ClaimIdSchema).default([]),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.rating === "UNDETERMINABLE") {
      if (data.score !== null && data.score !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "score must be null when rating is UNDETERMINABLE",
          path: ["score"],
        });
      }
      if (data.supporting_claim_ids.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "supporting_claim_ids must be empty when rating is UNDETERMINABLE",
          path: ["supporting_claim_ids"],
        });
      }
    } else if (data.score === null || data.score === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "score is required unless rating is UNDETERMINABLE",
        path: ["score"],
      });
    }
  });
export type SupportingSignalItem = z.infer<typeof SupportingSignalItemSchema>;

// pydantic SupportingSignals(ScoredField) — ScoredField + signals list.
export const SupportingSignalsSchema = ScoredFieldSchema.and(
  z.object({ signals: z.array(SupportingSignalItemSchema).default([]) }).strict()
);
export type SupportingSignals = z.infer<typeof SupportingSignalsSchema>;

// pydantic BucketScores — no `technical_claim_precision`, no separate
// `recruiter_rubric` object (that concept doesn't exist in the pydantic
// model at all); has `qualification_alignment` instead, and
// `supporting_signals` is the richer SupportingSignals type.
export const BucketScoresSchema = z
  .object({
    primary_evidence: DualAxisScoredFieldSchema,
    secondary_evidence: DualAxisScoredFieldSchema,
    concept_alignment: ScoredFieldSchema,
    technology_alignment: TechnologyAlignmentSchema,
    qualification_alignment: QualificationAlignmentSchema,
    supporting_signals: SupportingSignalsSchema,
  })
  .strict();
export type BucketScores = z.infer<typeof BucketScoresSchema>;

// ---------------------------------------------------------------------------
// Requirement Analysis — pydantic `note` has no word limit; RequirementCategory
// also has a `qualifications` list (previously missing).
// ---------------------------------------------------------------------------

export const RequirementAssessmentSchema = z
  .object({
    name: z.string(),
    status: RequirementStatusSchema,
    supporting_claim_ids: z.array(ClaimIdSchema),
    note: z.string(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.status === "MISSING" && data.supporting_claim_ids.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "supporting_claim_ids must be empty when status is MISSING",
        path: ["supporting_claim_ids"],
      });
    }
    if (data.status !== "MISSING" && data.supporting_claim_ids.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "supporting_claim_ids required unless status is MISSING",
        path: ["supporting_claim_ids"],
      });
    }
  });
export type RequirementAssessment = z.infer<typeof RequirementAssessmentSchema>;

export const RequirementCategorySchema = z
  .object({
    technologies: z.array(RequirementAssessmentSchema).default([]),
    concepts: z.array(RequirementAssessmentSchema).default([]),
    qualifications: z.array(RequirementAssessmentSchema).default([]),
  })
  .strict();
export type RequirementCategory = z.infer<typeof RequirementCategorySchema>;

export const RequirementAnalysisSchema = z
  .object({
    mandatory: RequirementCategorySchema,
    preferred: RequirementCategorySchema,
    bonus: RequirementCategorySchema,
  })
  .strict();
export type RequirementAnalysis = z.infer<typeof RequirementAnalysisSchema>;

// ---------------------------------------------------------------------------
// Project Analysis — pydantic PrioritizedProject has relevance/quality
// (ScoreRating), score, rating, priority, repository_url, summary,
// supporting_claim_ids — NOT relevance_evidence/verification_value/live_url.
// ---------------------------------------------------------------------------

export const PrioritizedProjectSchema = z
  .object({
    project_id: ClaimIdSchema,
    relevance: ScoreRatingSchema,
    quality: ScoreRatingSchema,
    score: z.number().int().min(0).max(100).nullable().optional().default(null),
    rating: RatingSchema,
    priority: z.number().int().min(1),
    repository_url: z.string().nullable().optional().default(null),
    summary: z.string(),
    supporting_claim_ids: z.array(ClaimIdSchema).default([]),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.rating === "UNDETERMINABLE") {
      if (data.score !== null && data.score !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "score must be null when rating is UNDETERMINABLE",
          path: ["score"],
        });
      }
      if (data.supporting_claim_ids.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "supporting_claim_ids must be empty when rating is UNDETERMINABLE",
          path: ["supporting_claim_ids"],
        });
      }
    } else if (data.score === null || data.score === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "score is required unless rating is UNDETERMINABLE",
        path: ["score"],
      });
    }
  });
export type PrioritizedProject = z.infer<typeof PrioritizedProjectSchema>;

export const ProjectAnalysisSchema = z
  .object({
    prioritized_projects: z.array(PrioritizedProjectSchema).default([]),
    ignored_projects: z.array(ClaimIdSchema).default([]),
  })
  .strict();
export type ProjectAnalysis = z.infer<typeof ProjectAnalysisSchema>;

export const ScoreDriverUpSchema = z
  .object({
    claim_ids: z.array(ClaimIdSchema),
    reason: z.string().superRefine(maxWords(15, "reason")),
  })
  .strict();
export type ScoreDriverUp = z.infer<typeof ScoreDriverUpSchema>;

export const ScoreDriverDownSchema = z
  .object({
    claim_ids: z.array(ClaimIdSchema),
    reason: z.string().superRefine(maxWords(15, "reason")),
    impact: ImpactSchema,
  })
  .strict();
export type ScoreDriverDown = z.infer<typeof ScoreDriverDownSchema>;

export const ScoreRationaleSchema = z
  .object({
    drivers_up: z.array(ScoreDriverUpSchema).default([]),
    drivers_down: z.array(ScoreDriverDownSchema).default([]),
  })
  .strict();
export type ScoreRationale = z.infer<typeof ScoreRationaleSchema>;

// ---------------------------------------------------------------------------
// Verification Plan — pydantic VerificationTarget has no claim_summary/
// why_verify; VerificationPlan has no repository_strategy.
// ---------------------------------------------------------------------------

export const VerificationTargetSchema = z
  .object({
    claim_id: ClaimIdSchema,
    claim_type: ClaimTypeSchema,
    related_project_id: ClaimIdSchema.nullable().optional().default(null),
    importance: ImportanceSchema,
    search_hints: z.array(z.string()).max(3).default([]),
  })
  .strict();
export type VerificationTarget = z.infer<typeof VerificationTargetSchema>;

export const VerificationPlanSchema = z
  .object({
    verification_targets: z.array(VerificationTargetSchema).max(5).default([]),
  })
  .strict();
export type VerificationPlan = z.infer<typeof VerificationPlanSchema>;

// ---------------------------------------------------------------------------
// Confidence / Overall
// ---------------------------------------------------------------------------

export const ReportConfidenceSchema = z
  .object({
    extraction_quality: ConfidenceSchema,
    scoring_quality: ConfidenceSchema,
    overall: ConfidenceSchema,
  })
  .strict();
export type ReportConfidence = z.infer<typeof ReportConfidenceSchema>;

// pydantic OverallEvaluation — adds overall_role_fit_score (0-100), which
// was missing from the previous TS `Overall` schema.
export const OverallEvaluationSchema = z
  .object({
    overall_role_fit: OverallRoleFitSchema,
    overall_role_fit_score: z.number().int().min(0).max(100),
    repository_priority: RepositoryPrioritySchema,
  })
  .strict();
export type OverallEvaluation = z.infer<typeof OverallEvaluationSchema>;

// ---------------------------------------------------------------------------
// Metadata — pydantic job_id/application_id/extraction_id are plain strings,
// NOT constrained to UUID format; schema_version defaults to "v4".
// ---------------------------------------------------------------------------

export const MetadataLLMOutputSchema = z
  .object({
    schema_version: z.string().default("v4"),
  })
  .strict();
export type MetadataLLMOutput = z.infer<typeof MetadataLLMOutputSchema>;

export const MetadataFullSchema = z
  .object({
    schema_version: z.string().default("v4"),
    job_id: z.string(),
    application_id: z.string(),
    extraction_id: z.string(),
    model: z.string(),
    timestamp: z.string(),
    evaluation_duration_ms: z.number().int().nonnegative(),
  })
  .strict();
export type MetadataFull = z.infer<typeof MetadataFullSchema>;

export const ComputedScoresSchema = z
  .object({
    requirement_coverage: z.number().min(0).max(15),
    recruiter_weighted_priorities: z.number().min(0).max(25),
    resume_match_score: z.number().min(0).max(100),
  })
  .strict();
export type ComputedScores = z.infer<typeof ComputedScoresSchema>;


export const ResumeEvaluationReportLLMOutputSchema = z
  .object({
    metadata: MetadataLLMOutputSchema,
    requirement_analysis: RequirementAnalysisSchema,
    project_analysis: ProjectAnalysisSchema,
    bucket_scores: BucketScoresSchema,
    score_rationale: ScoreRationaleSchema,
    decision_critical_claims: z.array(ClaimIdSchema).max(5).default([]),
    verification_plan: VerificationPlanSchema,
    confidence: ReportConfidenceSchema,
    overall: OverallEvaluationSchema,
  })
  .strict();
export type ResumeEvaluationReportLLMOutput = z.infer<
  typeof ResumeEvaluationReportLLMOutputSchema
>;

export const ResumeEvaluationReportSchema = z
  .object({
    metadata: MetadataFullSchema,
    requirement_analysis: RequirementAnalysisSchema,
    project_analysis: ProjectAnalysisSchema,
    bucket_scores: BucketScoresSchema,
    computed_scores: ComputedScoresSchema,
    score_rationale: ScoreRationaleSchema,
    decision_critical_claims: z.array(ClaimIdSchema).max(5).default([]),
    verification_plan: VerificationPlanSchema,
    confidence: ReportConfidenceSchema,
    overall: OverallEvaluationSchema,
  })
  .strict();
export type ResumeEvaluationReport = z.infer<typeof ResumeEvaluationReportSchema>;

export function parseResumeEvaluationReport(json: unknown): ResumeEvaluationReport {
  return ResumeEvaluationReportSchema.parse(json);
}

export function safeParseResumeEvaluationReport(json: unknown) {
  return ResumeEvaluationReportSchema.safeParse(json);
}