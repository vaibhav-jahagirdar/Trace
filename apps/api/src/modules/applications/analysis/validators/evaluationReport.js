"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeEvaluationReportSchema = exports.ResumeEvaluationReportLLMOutputSchema = exports.ComputedScoresSchema = exports.MetadataFullSchema = exports.MetadataLLMOutputSchema = exports.OverallEvaluationSchema = exports.ReportConfidenceSchema = exports.VerificationPlanSchema = exports.VerificationTargetSchema = exports.ScoreRationaleSchema = exports.ScoreDriverDownSchema = exports.ScoreDriverUpSchema = exports.ProjectAnalysisSchema = exports.PrioritizedProjectSchema = exports.RequirementAnalysisSchema = exports.RequirementCategorySchema = exports.RequirementAssessmentSchema = exports.BucketScoresSchema = exports.SupportingSignalsSchema = exports.SupportingSignalItemSchema = exports.QualificationAlignmentSchema = exports.TechnologyAlignmentSchema = exports.DualAxisScoredFieldSchema = exports.ScoreRatingSchema = exports.ScoredFieldSchema = exports.ImpactSchema = exports.RepositoryPrioritySchema = exports.OverallRoleFitSchema = exports.AlignmentRatingSchema = exports.ExperienceSourceSchema = exports.ImportanceSchema = exports.ClaimTypeSchema = exports.RequirementStatusSchema = exports.PriorityTypeSchema = exports.ConfidenceSchema = exports.RatingSchema = exports.ClaimIdSchema = void 0;
exports.parseResumeEvaluationReport = parseResumeEvaluationReport;
exports.safeParseResumeEvaluationReport = safeParseResumeEvaluationReport;
const zod_1 = require("zod");
exports.ClaimIdSchema = zod_1.z
    .string()
    .regex(/^claim_\d{4}$/, "claim_id must match ^claim_\\d{4}$");
exports.RatingSchema = zod_1.z.enum([
    "VERY_LOW",
    "LOW",
    "MEDIUM",
    "HIGH",
    "VERY_HIGH",
    "UNDETERMINABLE",
]);
exports.ConfidenceSchema = zod_1.z.enum(["HIGH", "MEDIUM", "LOW"]);
exports.PriorityTypeSchema = zod_1.z.enum(["MANDATORY", "PREFERRED", "BONUS"]);
exports.RequirementStatusSchema = zod_1.z.enum(["CONFIRMED", "UNCONFIRMED", "MISSING"]);
exports.ClaimTypeSchema = zod_1.z.enum([
    "RESPONSIBILITY",
    "ACHIEVEMENT",
    "IMPLEMENTATION",
    "ARCHITECTURAL",
    "MAJOR_FEATURE",
]);
exports.ImportanceSchema = zod_1.z.enum(["CRITICAL", "HIGH", "MEDIUM"]);
exports.ExperienceSourceSchema = zod_1.z.enum(["WORK", "PROJECT"]);
exports.AlignmentRatingSchema = zod_1.z.enum(["HIGH", "MEDIUM", "LOW", "UNDETERMINABLE"]);
exports.OverallRoleFitSchema = zod_1.z.enum([
    "EXCEPTIONAL",
    "STRONG",
    "GOOD",
    "MODERATE",
    "WEAK",
    "POOR",
]);
exports.RepositoryPrioritySchema = zod_1.z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]);
exports.ImpactSchema = zod_1.z.enum(["HIGH", "MEDIUM", "LOW"]);
function wordCount(v) {
    return v.trim() === "" ? 0 : v.trim().split(/\s+/).length;
}
function maxWords(maxWordsAllowed, fieldLabel) {
    return (v, ctx) => {
        const n = wordCount(v);
        if (v && n > maxWordsAllowed) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: `${fieldLabel ?? "value"} must be \u2264 ${maxWordsAllowed} words, got ${n}`,
            });
        }
    };
}
exports.ScoredFieldSchema = zod_1.z
    .object({
    rating: exports.RatingSchema,
    score: zod_1.z.number().int().min(0).max(100).nullable().optional().default(null),
    confidence: exports.ConfidenceSchema,
    summary: zod_1.z.string(),
    supporting_claim_ids: zod_1.z.array(exports.ClaimIdSchema).default([]),
})
    .strict()
    .superRefine((data, ctx) => {
    if (data.rating === "UNDETERMINABLE") {
        if (data.score !== null && data.score !== undefined) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "score must be null when rating is UNDETERMINABLE",
                path: ["score"],
            });
        }
        if (data.supporting_claim_ids.length > 0) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "supporting_claim_ids must be empty when rating is UNDETERMINABLE",
                path: ["supporting_claim_ids"],
            });
        }
    }
    else if (data.score === null || data.score === undefined) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "score is required unless rating is UNDETERMINABLE",
            path: ["score"],
        });
    }
});
// ---------------------------------------------------------------------------
// ScoreRating — pydantic: score/rating/confidence(optional)/
// supporting_claim_ids. Only checks the UNDETERMINABLE <=> score-null rule.
// ---------------------------------------------------------------------------
exports.ScoreRatingSchema = zod_1.z
    .object({
    score: zod_1.z.number().int().min(0).max(100).nullable().optional().default(null),
    rating: exports.RatingSchema,
    confidence: exports.ConfidenceSchema.nullable().optional().default(null),
    supporting_claim_ids: zod_1.z.array(exports.ClaimIdSchema).default([]),
})
    .strict()
    .superRefine((data, ctx) => {
    if (data.rating === "UNDETERMINABLE" && data.score !== null && data.score !== undefined) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "score must be null when rating is UNDETERMINABLE",
            path: ["score"],
        });
    }
    if (data.rating !== "UNDETERMINABLE" && (data.score === null || data.score === undefined)) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "score is required unless rating is UNDETERMINABLE",
            path: ["score"],
        });
    }
});
// ---------------------------------------------------------------------------
// DualAxisScoredField — pydantic: source_type/relevance(ScoreRating)/
// quality(ScoreRating)/score/rating/confidence/summary/supporting_claim_ids.
// relevance.rating and quality.rating must agree on UNDETERMINABLE-ness;
// when both UNDETERMINABLE, rating/score/supporting_claim_ids must reflect
// that; otherwise rating cannot be UNDETERMINABLE and score is required.
// ---------------------------------------------------------------------------
exports.DualAxisScoredFieldSchema = zod_1.z
    .object({
    source_type: exports.ExperienceSourceSchema,
    relevance: exports.ScoreRatingSchema,
    quality: exports.ScoreRatingSchema,
    score: zod_1.z.number().int().min(0).max(100).nullable().optional().default(null),
    rating: exports.RatingSchema,
    confidence: exports.ConfidenceSchema,
    summary: zod_1.z.string(),
    supporting_claim_ids: zod_1.z.array(exports.ClaimIdSchema).default([]),
})
    .strict()
    .superRefine((data, ctx) => {
    const relevanceUnd = data.relevance.rating === "UNDETERMINABLE";
    const qualityUnd = data.quality.rating === "UNDETERMINABLE";
    if (relevanceUnd !== qualityUnd) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "relevance and quality must both be UNDETERMINABLE or both be scored",
            path: ["quality", "rating"],
        });
        return;
    }
    if (relevanceUnd) {
        if (data.rating !== "UNDETERMINABLE") {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "rating must be UNDETERMINABLE when both axes are UNDETERMINABLE",
                path: ["rating"],
            });
        }
        if (data.score !== null && data.score !== undefined) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "score must be null when axes are UNDETERMINABLE",
                path: ["score"],
            });
        }
        if (data.supporting_claim_ids.length > 0) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "supporting_claim_ids must be empty when axes are UNDETERMINABLE",
                path: ["supporting_claim_ids"],
            });
        }
    }
    else {
        if (data.rating === "UNDETERMINABLE") {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "rating cannot be UNDETERMINABLE when axes are scored",
                path: ["rating"],
            });
        }
        if (data.score === null || data.score === undefined) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "score is required when axes are scored",
                path: ["score"],
            });
        }
    }
});
exports.TechnologyAlignmentSchema = exports.ScoredFieldSchema.and(zod_1.z.object({ mandatory_technologies_present: zod_1.z.boolean() }).strict());
// pydantic QualificationAlignment — previously missing from the TS file.
exports.QualificationAlignmentSchema = exports.ScoredFieldSchema.and(zod_1.z.object({ mandatory_qualifications_present: zod_1.z.boolean() }).strict());
// pydantic SupportingSignalItem — code/priority_type/rating/score/note/
// supporting_claim_ids. No `confidence` field (unlike the old RubricItem).
exports.SupportingSignalItemSchema = zod_1.z
    .object({
    code: zod_1.z.string(),
    priority_type: exports.PriorityTypeSchema,
    rating: exports.RatingSchema,
    score: zod_1.z.number().int().min(0).max(100).nullable().optional().default(null),
    note: zod_1.z.string(),
    supporting_claim_ids: zod_1.z.array(exports.ClaimIdSchema).default([]),
})
    .strict()
    .superRefine((data, ctx) => {
    if (data.rating === "UNDETERMINABLE") {
        if (data.score !== null && data.score !== undefined) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "score must be null when rating is UNDETERMINABLE",
                path: ["score"],
            });
        }
        if (data.supporting_claim_ids.length > 0) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "supporting_claim_ids must be empty when rating is UNDETERMINABLE",
                path: ["supporting_claim_ids"],
            });
        }
    }
    else if (data.score === null || data.score === undefined) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "score is required unless rating is UNDETERMINABLE",
            path: ["score"],
        });
    }
});
// pydantic SupportingSignals(ScoredField) — ScoredField + signals list.
exports.SupportingSignalsSchema = exports.ScoredFieldSchema.and(zod_1.z.object({ signals: zod_1.z.array(exports.SupportingSignalItemSchema).default([]) }).strict());
// pydantic BucketScores — no `technical_claim_precision`, no separate
// `recruiter_rubric` object (that concept doesn't exist in the pydantic
// model at all); has `qualification_alignment` instead, and
// `supporting_signals` is the richer SupportingSignals type.
exports.BucketScoresSchema = zod_1.z
    .object({
    primary_evidence: exports.DualAxisScoredFieldSchema,
    secondary_evidence: exports.DualAxisScoredFieldSchema,
    concept_alignment: exports.ScoredFieldSchema,
    technology_alignment: exports.TechnologyAlignmentSchema,
    qualification_alignment: exports.QualificationAlignmentSchema,
    supporting_signals: exports.SupportingSignalsSchema,
})
    .strict();
// ---------------------------------------------------------------------------
// Requirement Analysis — pydantic `note` has no word limit; RequirementCategory
// also has a `qualifications` list (previously missing).
// ---------------------------------------------------------------------------
exports.RequirementAssessmentSchema = zod_1.z
    .object({
    name: zod_1.z.string(),
    status: exports.RequirementStatusSchema,
    supporting_claim_ids: zod_1.z.array(exports.ClaimIdSchema),
    note: zod_1.z.string(),
})
    .strict()
    .superRefine((data, ctx) => {
    if (data.status === "MISSING" && data.supporting_claim_ids.length > 0) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "supporting_claim_ids must be empty when status is MISSING",
            path: ["supporting_claim_ids"],
        });
    }
    if (data.status !== "MISSING" && data.supporting_claim_ids.length === 0) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "supporting_claim_ids required unless status is MISSING",
            path: ["supporting_claim_ids"],
        });
    }
});
exports.RequirementCategorySchema = zod_1.z
    .object({
    technologies: zod_1.z.array(exports.RequirementAssessmentSchema).default([]),
    concepts: zod_1.z.array(exports.RequirementAssessmentSchema).default([]),
    qualifications: zod_1.z.array(exports.RequirementAssessmentSchema).default([]),
})
    .strict();
exports.RequirementAnalysisSchema = zod_1.z
    .object({
    mandatory: exports.RequirementCategorySchema,
    preferred: exports.RequirementCategorySchema,
    bonus: exports.RequirementCategorySchema,
})
    .strict();
// ---------------------------------------------------------------------------
// Project Analysis — pydantic PrioritizedProject has relevance/quality
// (ScoreRating), score, rating, priority, repository_url, summary,
// supporting_claim_ids — NOT relevance_evidence/verification_value/live_url.
// ---------------------------------------------------------------------------
exports.PrioritizedProjectSchema = zod_1.z
    .object({
    project_id: exports.ClaimIdSchema,
    relevance: exports.ScoreRatingSchema,
    quality: exports.ScoreRatingSchema,
    score: zod_1.z.number().int().min(0).max(100).nullable().optional().default(null),
    rating: exports.RatingSchema,
    priority: zod_1.z.number().int().min(1),
    repository_url: zod_1.z.string().nullable().optional().default(null),
    summary: zod_1.z.string(),
    supporting_claim_ids: zod_1.z.array(exports.ClaimIdSchema).default([]),
})
    .strict()
    .superRefine((data, ctx) => {
    if (data.rating === "UNDETERMINABLE") {
        if (data.score !== null && data.score !== undefined) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "score must be null when rating is UNDETERMINABLE",
                path: ["score"],
            });
        }
        if (data.supporting_claim_ids.length > 0) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "supporting_claim_ids must be empty when rating is UNDETERMINABLE",
                path: ["supporting_claim_ids"],
            });
        }
    }
    else if (data.score === null || data.score === undefined) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "score is required unless rating is UNDETERMINABLE",
            path: ["score"],
        });
    }
});
exports.ProjectAnalysisSchema = zod_1.z
    .object({
    prioritized_projects: zod_1.z.array(exports.PrioritizedProjectSchema).default([]),
    ignored_projects: zod_1.z.array(exports.ClaimIdSchema).default([]),
})
    .strict();
exports.ScoreDriverUpSchema = zod_1.z
    .object({
    claim_ids: zod_1.z.array(exports.ClaimIdSchema),
    reason: zod_1.z.string().superRefine(maxWords(15, "reason")),
})
    .strict();
exports.ScoreDriverDownSchema = zod_1.z
    .object({
    claim_ids: zod_1.z.array(exports.ClaimIdSchema),
    reason: zod_1.z.string().superRefine(maxWords(15, "reason")),
    impact: exports.ImpactSchema,
})
    .strict();
exports.ScoreRationaleSchema = zod_1.z
    .object({
    drivers_up: zod_1.z.array(exports.ScoreDriverUpSchema).default([]),
    drivers_down: zod_1.z.array(exports.ScoreDriverDownSchema).default([]),
})
    .strict();
// ---------------------------------------------------------------------------
// Verification Plan — pydantic VerificationTarget has no claim_summary/
// why_verify; VerificationPlan has no repository_strategy.
// ---------------------------------------------------------------------------
exports.VerificationTargetSchema = zod_1.z
    .object({
    claim_id: exports.ClaimIdSchema,
    claim_type: exports.ClaimTypeSchema,
    related_project_id: exports.ClaimIdSchema.nullable().optional().default(null),
    importance: exports.ImportanceSchema,
    search_hints: zod_1.z.array(zod_1.z.string()).max(3).default([]),
})
    .strict();
exports.VerificationPlanSchema = zod_1.z
    .object({
    verification_targets: zod_1.z.array(exports.VerificationTargetSchema).max(5).default([]),
})
    .strict();
// ---------------------------------------------------------------------------
// Confidence / Overall
// ---------------------------------------------------------------------------
exports.ReportConfidenceSchema = zod_1.z
    .object({
    extraction_quality: exports.ConfidenceSchema,
    scoring_quality: exports.ConfidenceSchema,
    overall: exports.ConfidenceSchema,
})
    .strict();
// pydantic OverallEvaluation — adds overall_role_fit_score (0-100), which
// was missing from the previous TS `Overall` schema.
exports.OverallEvaluationSchema = zod_1.z
    .object({
    overall_role_fit: exports.OverallRoleFitSchema,
    overall_role_fit_score: zod_1.z.number().int().min(0).max(100),
    repository_priority: exports.RepositoryPrioritySchema,
})
    .strict();
// ---------------------------------------------------------------------------
// Metadata — pydantic job_id/application_id/extraction_id are plain strings,
// NOT constrained to UUID format; schema_version defaults to "v4".
// ---------------------------------------------------------------------------
exports.MetadataLLMOutputSchema = zod_1.z
    .object({
    schema_version: zod_1.z.string().default("v4"),
})
    .strict();
exports.MetadataFullSchema = zod_1.z
    .object({
    schema_version: zod_1.z.string().default("v4"),
    job_id: zod_1.z.string(),
    application_id: zod_1.z.string(),
    extraction_id: zod_1.z.string(),
    model: zod_1.z.string(),
    timestamp: zod_1.z.string(),
    evaluation_duration_ms: zod_1.z.number().int().nonnegative(),
})
    .strict();
exports.ComputedScoresSchema = zod_1.z
    .object({
    requirement_coverage: zod_1.z.number().min(0).max(15),
    recruiter_weighted_priorities: zod_1.z.number().min(0).max(25),
    resume_match_score: zod_1.z.number().min(0).max(100),
})
    .strict();
exports.ResumeEvaluationReportLLMOutputSchema = zod_1.z
    .object({
    metadata: exports.MetadataLLMOutputSchema,
    requirement_analysis: exports.RequirementAnalysisSchema,
    project_analysis: exports.ProjectAnalysisSchema,
    bucket_scores: exports.BucketScoresSchema,
    score_rationale: exports.ScoreRationaleSchema,
    decision_critical_claims: zod_1.z.array(exports.ClaimIdSchema).max(5).default([]),
    verification_plan: exports.VerificationPlanSchema,
    confidence: exports.ReportConfidenceSchema,
    overall: exports.OverallEvaluationSchema,
})
    .strict();
exports.ResumeEvaluationReportSchema = zod_1.z
    .object({
    metadata: exports.MetadataFullSchema,
    requirement_analysis: exports.RequirementAnalysisSchema,
    project_analysis: exports.ProjectAnalysisSchema,
    bucket_scores: exports.BucketScoresSchema,
    computed_scores: exports.ComputedScoresSchema,
    score_rationale: exports.ScoreRationaleSchema,
    decision_critical_claims: zod_1.z.array(exports.ClaimIdSchema).max(5).default([]),
    verification_plan: exports.VerificationPlanSchema,
    confidence: exports.ReportConfidenceSchema,
    overall: exports.OverallEvaluationSchema,
})
    .strict();
function parseResumeEvaluationReport(json) {
    return exports.ResumeEvaluationReportSchema.parse(json);
}
function safeParseResumeEvaluationReport(json) {
    return exports.ResumeEvaluationReportSchema.safeParse(json);
}
//# sourceMappingURL=evaluationReport.js.map