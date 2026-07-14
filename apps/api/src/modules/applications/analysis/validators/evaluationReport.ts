
import { z } from "zod";


export const RatingSchema = z.enum([
  "VERY_LOW",
  "LOW",
  "MEDIUM",
  "HIGH",
  "VERY_HIGH",
  "UNDETERMINABLE",
]);
export type Rating = z.infer<typeof RatingSchema>;

export const RatingNoUndeterminableSchema = z.enum([
  "VERY_LOW",
  "LOW",
  "MEDIUM",
  "HIGH",
  "VERY_HIGH",
]);
export type RatingNoUndeterminable = z.infer<typeof RatingNoUndeterminableSchema>;

export const ConfidenceSchema = z.enum(["HIGH", "MEDIUM", "LOW"]);
export type Confidence = z.infer<typeof ConfidenceSchema>;

export const PriorityTypeSchema = z.enum(["MANDATORY", "PREFERRED", "BONUS"]);
export type PriorityType = z.infer<typeof PriorityTypeSchema>;

export const RequirementStatusSchema = z.enum(["CONFIRMED", "UNCONFIRMED", "MISSING"]);
export type RequirementStatus = z.infer<typeof RequirementStatusSchema>;


export const ClaimIdSchema = z.string();
export type ClaimId = z.infer<typeof ClaimIdSchema>;


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
    supporting_claim_ids: z.array(ClaimIdSchema),
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
    } else {
      if (data.score === null || data.score === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "score is required unless rating is UNDETERMINABLE",
          path: ["score"],
        });
      }
      if (data.supporting_claim_ids.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "supporting_claim_ids required — no supporting claim, no conclusion",
          path: ["supporting_claim_ids"],
        });
      }
    }
  });
export type ScoredField = z.infer<typeof ScoredFieldSchema>;

export const DualAxisScoredFieldSchema = z
  .object({
    relevance: ScoredFieldSchema,
    quality: ScoredFieldSchema,
    score: z.number().int().min(0).max(100),
    rating: RatingNoUndeterminableSchema,
    confidence: ConfidenceSchema,
    summary: z.string(),
    supporting_claim_ids: z.array(ClaimIdSchema),
  })
  .strict();
export type DualAxisScoredField = z.infer<typeof DualAxisScoredFieldSchema>;

export const RubricItemSchema = z
  .object({
    code: z.string(),
    priority_type: PriorityTypeSchema, // copied from job context
    rating: RatingSchema,
    score: z.number().int().min(0).max(100).nullable().optional().default(null),
    confidence: ConfidenceSchema,
    summary: z.string(),
    supporting_claim_ids: z.array(ClaimIdSchema),
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
    } else {
      if (data.score === null || data.score === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "score is required unless rating is UNDETERMINABLE",
          path: ["score"],
        });
      }
    }
  });
export type RubricItem = z.infer<typeof RubricItemSchema>;

// ---------------------------------------------------------------------------
// §1 Metadata
// ---------------------------------------------------------------------------

export const MetadataSchema = z
  .object({
    schema_version: z.string(),
    job_id: z.string().uuid(),
    application_id: z.string().uuid(),
    extraction_id: z.string().uuid(),
    model: z.string(),
    timestamp: z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
      message: "timestamp must be a valid ISO 8601 datetime string",
    }),
    evaluation_duration_ms: z.number().int().nonnegative(),
  })
  .strict();
export type Metadata = z.infer<typeof MetadataSchema>;

export const MetadataLLMOutputSchema = z
  .object({
    schema_version: z.string(),
  })
  .strict();
export type MetadataLLMOutput = z.infer<typeof MetadataLLMOutputSchema>;

// ---------------------------------------------------------------------------
// §2 Role Fit
// ---------------------------------------------------------------------------

export const AlignmentRatingSchema = z.enum(["HIGH", "MEDIUM", "LOW", "UNDETERMINABLE"]);
export type AlignmentRating = z.infer<typeof AlignmentRatingSchema>;

export const RoleFitSchema = z
  .object({
    role_alignment_evidence: z.array(ClaimIdSchema),
    role_alignment_summary: z.string().superRefine(maxWords(25, "role_alignment_summary")),
    role_alignment: AlignmentRatingSchema,

    responsibility_alignment_evidence: z.array(ClaimIdSchema),
    responsibility_alignment_summary: z
      .string()
      .superRefine(maxWords(25, "responsibility_alignment_summary")),
    responsibility_alignment: AlignmentRatingSchema,

    domain_alignment_evidence: z.array(ClaimIdSchema),
    domain_alignment_summary: z.string().superRefine(maxWords(25, "domain_alignment_summary")),
    domain_alignment: AlignmentRatingSchema,
  })
  .strict();
export type RoleFit = z.infer<typeof RoleFitSchema>;

// ---------------------------------------------------------------------------
// §3 Requirement Analysis
// ---------------------------------------------------------------------------

export const RequirementAssessmentSchema = z
  .object({
    name: z.string(),
    status: RequirementStatusSchema,
    supporting_claim_ids: z.array(ClaimIdSchema),
    note: z.string().superRefine(maxWords(20, "note")),
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
    technologies: z.array(RequirementAssessmentSchema),
    concepts: z.array(RequirementAssessmentSchema),
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



export const ExperienceSourceSchema = z.enum(["WORK", "PROJECT"]);
export type ExperienceSource = z.infer<typeof ExperienceSourceSchema>;

export const RelevantExperienceSchema = z
  .object({
    experience_id: ClaimIdSchema,
    relevance_evidence: z.array(ClaimIdSchema),
    relevance_summary: z.string().superRefine(maxWords(30, "relevance_summary")),
  })
  .strict();
export type RelevantExperience = z.infer<typeof RelevantExperienceSchema>;

export const ExperienceAnalysisSchema = z
  .object({
    primary_source: ExperienceSourceSchema,
    secondary_source: ExperienceSourceSchema,
    relevant_experiences: z.array(RelevantExperienceSchema),
    // synthesis only — no new claims
    experience_summary: z.string().superRefine(maxWords(50, "experience_summary")),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.primary_source === data.secondary_source) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "secondary_source must always be the other one",
        path: ["secondary_source"],
      });
    }
  });
export type ExperienceAnalysis = z.infer<typeof ExperienceAnalysisSchema>;



export const PrioritizedProjectSchema = z
  .object({
    project_id: ClaimIdSchema,
    relevance_evidence: z.array(ClaimIdSchema),
    summary: z.string().superRefine(maxWords(30, "summary")),
    verification_value: z.enum(["HIGH", "MEDIUM", "LOW"]),
    priority: z.number().int().min(1), // 1 = highest
    repository_url: z.string().nullable().optional().default(null), // system-populated
    live_url: z.string().nullable().optional().default(null), // system-populated
  })
  .strict();
export type PrioritizedProject = z.infer<typeof PrioritizedProjectSchema>;

export const ProjectAnalysisSchema = z
  .object({
    prioritized_projects: z.array(PrioritizedProjectSchema),
  
    ignored_projects: z.array(ClaimIdSchema),
  })
  .strict();
export type ProjectAnalysis = z.infer<typeof ProjectAnalysisSchema>;


export const RecruiterRubricSchema = z
  .object({
    evaluation_dimensions: z.array(RubricItemSchema),
    evidence_categories: z.array(RubricItemSchema), 
    success_signals: z.array(RubricItemSchema), 
  })
  .strict();
export type RecruiterRubric = z.infer<typeof RecruiterRubricSchema>;


export const TechnologyAlignmentSchema = ScoredFieldSchema.and(
  z.object({ mandatory_technologies_present: z.boolean() }).strict()
);
export type TechnologyAlignment = z.infer<typeof TechnologyAlignmentSchema>;

export const BucketScoresSchema = z
  .object({
    primary_evidence: DualAxisScoredFieldSchema,
    secondary_evidence: DualAxisScoredFieldSchema, 
    concept_alignment: ScoredFieldSchema, 
    technology_alignment: TechnologyAlignmentSchema, 
    technical_claim_precision: ScoredFieldSchema, 
    supporting_signals: ScoredFieldSchema, 
   
  })
  .strict();
export type BucketScores = z.infer<typeof BucketScoresSchema>;

export const ComputedScoresSchema = z
  .object({
    requirement_coverage: z.number().min(0).max(15),
    recruiter_weighted_priorities: z.number().min(0).max(25),
    resume_match_score: z.number().min(0).max(100),
  })
  .strict();
export type ComputedScores = z.infer<typeof ComputedScoresSchema>;


export const StrengthSchema = z
  .object({
    category: z.string(),
    supporting_claim_ids: z.array(ClaimIdSchema),
    summary: z.string().superRefine(maxWords(25, "summary")),
  })
  .strict();
export type Strength = z.infer<typeof StrengthSchema>;

export const GapSchema = z
  .object({
    category: z.string(),
    supporting_claim_ids: z.array(ClaimIdSchema), 
    summary: z.string().superRefine(maxWords(25, "summary")),
    impact: z.enum(["HIGH", "MEDIUM", "LOW"]),
  })
  .strict();
export type Gap = z.infer<typeof GapSchema>;


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

export const VerificationTargetSchema = z
  .object({
    claim_id: ClaimIdSchema,
    claim_type: ClaimTypeSchema,
    claim_summary: z.string().superRefine(maxWords(20, "claim_summary")),
    related_project_id: ClaimIdSchema.nullable().optional().default(null),
    importance: ImportanceSchema,
    why_verify: z.string().superRefine(maxWords(25, "why_verify")),
  
    search_hints: z.array(z.string()).max(3),
  })
  .strict();
export type VerificationTarget = z.infer<typeof VerificationTargetSchema>;

export const VerificationPlanSchema = z
  .object({
    verification_targets: z.array(VerificationTargetSchema),
    repository_strategy: z.string().superRefine(maxWords(40, "repository_strategy")),
  })
  .strict();
export type VerificationPlan = z.infer<typeof VerificationPlanSchema>;


export const TechnicalOutlierSchema = z
  .object({
    is_outlier: z.boolean(),
    supporting_claim_ids: z.array(ClaimIdSchema), // required when is_outlier is true
    justification: z.string().superRefine(maxWords(40, "justification")),
    missing_requirements: z.array(z.string()),
    repository_analysis_recommended: z.boolean(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.is_outlier && data.supporting_claim_ids.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "supporting_claim_ids required when is_outlier is true",
        path: ["supporting_claim_ids"],
      });
    }
  });
export type TechnicalOutlier = z.infer<typeof TechnicalOutlierSchema>;

export const ReportConfidenceSchema = z
  .object({
 
    extraction_quality: ConfidenceSchema,
   
    scoring_quality: ConfidenceSchema,
  
    overall: ConfidenceSchema,
  })
  .strict();
export type ReportConfidence = z.infer<typeof ReportConfidenceSchema>;


export const OverallSchema = z
  .object({
    overall_role_fit: z.enum([
      "EXCEPTIONAL",
      "STRONG",
      "GOOD",
      "MODERATE",
      "WEAK",
      "POOR",
    ]),
    repository_priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  
  })
  .strict();
export type Overall = z.infer<typeof OverallSchema>;


function maxWordsPerListItem(maxWordsAllowed: number, fieldLabel: string) {
  return (v: string[], ctx: z.RefinementCtx) => {
    for (const item of v) {
      const n = wordCount(item);
      if (n > maxWordsAllowed) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `each ${fieldLabel} must be \u2264 ${maxWordsAllowed} words: ${JSON.stringify(item)}`,
        });
      }
    }
  };
}

export const ExecutiveSummarySchema = z
  .object({
    recruiter_summary: z.string().superRefine(maxWords(60, "recruiter_summary")),
 
    top_strengths: z
      .array(z.string())
      .max(3)
      .superRefine(maxWordsPerListItem(12, "top_strength")),
    
    primary_risks: z
      .array(z.string())
      .max(3)
      .superRefine(maxWordsPerListItem(12, "primary_risk")),
  
  })
  .strict();
export type ExecutiveSummary = z.infer<typeof ExecutiveSummarySchema>;
           
export const ResumeEvaluationReportSchema = z
  .object({
    metadata: MetadataSchema,
    role_fit: RoleFitSchema,
    requirement_analysis: RequirementAnalysisSchema,
    experience_analysis: ExperienceAnalysisSchema,
    project_analysis: ProjectAnalysisSchema,
    recruiter_rubric: RecruiterRubricSchema,
    bucket_scores: BucketScoresSchema,
    computed_scores: ComputedScoresSchema,
    strengths: z.array(StrengthSchema),
    gaps: z.array(GapSchema),
    verification_plan: VerificationPlanSchema,
    technical_outlier: TechnicalOutlierSchema,
    confidence: ReportConfidenceSchema,
    overall: OverallSchema,
    executive_summary: ExecutiveSummarySchema,
  })
  .strict();
export type ResumeEvaluationReport = z.infer<typeof ResumeEvaluationReportSchema>;


export const ResumeEvaluationReportLLMOutputSchema = z
  .object({
    metadata: MetadataLLMOutputSchema,
    role_fit: RoleFitSchema,
    requirement_analysis: RequirementAnalysisSchema,
    experience_analysis: ExperienceAnalysisSchema,
    project_analysis: ProjectAnalysisSchema,
    recruiter_rubric: RecruiterRubricSchema,
    bucket_scores: BucketScoresSchema,
    strengths: z.array(StrengthSchema),
    gaps: z.array(GapSchema),
    verification_plan: VerificationPlanSchema,
    technical_outlier: TechnicalOutlierSchema,
    confidence: ReportConfidenceSchema,
    overall: OverallSchema,
    executive_summary: ExecutiveSummarySchema,
  })
  .strict();
export type ResumeEvaluationReportLLMOutput = z.infer<
  typeof ResumeEvaluationReportLLMOutputSchema
>;


export function parseResumeEvaluationReport(json: unknown): ResumeEvaluationReport {
  return ResumeEvaluationReportSchema.parse(json);
}

export function safeParseResumeEvaluationReport(json: unknown) {
  return ResumeEvaluationReportSchema.safeParse(json);
}
