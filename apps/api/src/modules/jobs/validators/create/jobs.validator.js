"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJobSchema = exports.requirementsSchema = exports.requirementSchema = exports.submissionRequirementsSchema = exports.successSignalsSchema = exports.successSignalSchema = exports.evidencePrioritiesSchema = exports.evaluationPrioritiesSchema = exports.evidencePrioritySchema = exports.evaluationPrioritySchema = exports.eligibilitySchema = void 0;
const zod_1 = require("zod");
exports.eligibilitySchema = zod_1.z
    .object({
    currency: zod_1.z
        .string()
        .trim()
        .min(1)
        .max(10),
    salary_min: zod_1.z
        .number()
        .nonnegative(),
    salary_max: zod_1.z
        .number()
        .nonnegative(),
    experience_min_years: zod_1.z
        .number()
        .min(0),
    experience_ideal_years: zod_1.z
        .number()
        .min(0),
    experience_max_years: zod_1.z
        .number()
        .min(0),
    notice_period_ideal_days: zod_1.z
        .number()
        .int()
        .min(0),
    notice_period_max_days: zod_1.z
        .number()
        .int()
        .min(0),
    relocation_assistance: zod_1.z.boolean(),
    visa_sponsorship: zod_1.z.boolean(),
    work_authorization_required: zod_1.z.boolean(),
    minimum_education_level: zod_1.z.enum([
        "NONE",
        "HIGH_SCHOOL",
        "DIPLOMA",
        "UNDERGRADUATE",
        "POSTGRADUATE",
    ])
})
    .superRefine((data, ctx) => {
    if (data.salary_min > data.salary_max) {
        ctx.addIssue({
            code: "custom",
            path: ["salary_max"],
            message: "salary_max must be greater than or equal to salary_min",
        });
    }
    if (data.experience_min_years >
        data.experience_ideal_years) {
        ctx.addIssue({
            code: "custom",
            path: ["experience_ideal_years"],
            message: "experience_ideal_years must be greater than or equal to experience_min_years",
        });
    }
    if (data.experience_ideal_years >
        data.experience_max_years) {
        ctx.addIssue({
            code: "custom",
            path: ["experience_max_years"],
            message: "experience_max_years must be greater than or equal to experience_ideal_years",
        });
    }
    if (data.notice_period_ideal_days >
        data.notice_period_max_days) {
        ctx.addIssue({
            code: "custom",
            path: ["notice_period_max_days"],
            message: "notice_period_max_days must be greater than or equal to notice_period_ideal_days",
        });
    }
});
exports.evaluationPrioritySchema = zod_1.z.object({
    evaluation_dimension_id: zod_1.z.uuid(),
    weight: zod_1.z
        .number()
        .int()
        .min(1)
        .max(100),
});
exports.evidencePrioritySchema = zod_1.z.object({
    evidence_category_id: zod_1.z.uuid(),
    weight: zod_1.z
        .number()
        .int()
        .min(1)
        .max(100),
});
exports.evaluationPrioritiesSchema = zod_1.z.array(exports.evaluationPrioritySchema);
exports.evidencePrioritiesSchema = zod_1.z.array(exports.evidencePrioritySchema);
exports.successSignalSchema = zod_1.z.object({
    success_signal_id: zod_1.z.string().uuid(),
    weight: zod_1.z.number().int().min(1).max(100),
});
exports.successSignalsSchema = zod_1.z.array(exports.successSignalSchema);
exports.submissionRequirementsSchema = zod_1.z.object({
    resume_required: zod_1.z.boolean(),
    github_required: zod_1.z.boolean(),
    portfolio_required: zod_1.z.boolean(),
    problem_solving_profile_required: zod_1.z.boolean(),
    linkedin_required: zod_1.z.boolean(),
    project_explanation_required: zod_1.z.boolean(),
    feature_explanation_required: zod_1.z.boolean(),
    zip_upload_allowed: zod_1.z.boolean(),
});
const technologyRequirementSchema = zod_1.z.object({
    requirement_type: zod_1.z.literal("TECHNOLOGY"),
    technology_id: zod_1.z.uuid(),
    priority_type: zod_1.z.enum([
        "MANDATORY",
        "PREFERRED",
        "BONUS",
    ]),
});
const conceptRequirementSchema = zod_1.z.object({
    requirement_type: zod_1.z.literal("CONCEPT"),
    concept_id: zod_1.z.uuid(),
    priority_type: zod_1.z.enum([
        "MANDATORY",
        "PREFERRED",
        "BONUS",
    ]),
});
exports.requirementSchema = zod_1.z.discriminatedUnion("requirement_type", [
    technologyRequirementSchema,
    conceptRequirementSchema,
]);
exports.requirementsSchema = zod_1.z.array(exports.requirementSchema);
exports.createJobSchema = zod_1.z.object({
    organization_id: zod_1.z.uuid(),
    role_category_id: zod_1.z.uuid(),
    title: zod_1.z
        .string()
        .trim()
        .min(1)
        .max(255),
    department: zod_1.z
        .string()
        .trim()
        .max(150)
        .optional(),
    employment_type: zod_1.z.enum([
        "FULL_TIME",
        "INTERNSHIP",
        "CONTRACT",
        "PART_TIME",
    ]),
    work_mode: zod_1.z.enum([
        "ONSITE",
        "HYBRID",
        "REMOTE",
    ]),
    remote_scope: zod_1.z.enum([
        "NONE",
        "GLOBAL",
        "COUNTRY",
        "REGIONAL"
    ]),
    country: zod_1.z
        .string()
        .trim()
        .min(1)
        .max(100),
    state: zod_1.z
        .string()
        .trim()
        .max(100)
        .optional(),
    city: zod_1.z
        .string()
        .trim()
        .max(100)
        .optional(),
    open_positions: zod_1.z
        .number()
        .int()
        .positive(),
    description: zod_1.z
        .string()
        .trim()
        .max(10000)
        .optional(),
    eligibility: exports.eligibilitySchema,
    submission_requirements: exports.submissionRequirementsSchema,
    evaluation_priorities: exports.evaluationPrioritiesSchema,
    evidence_priorities: exports.evidencePrioritiesSchema,
});
//# sourceMappingURL=jobs.validator.js.map