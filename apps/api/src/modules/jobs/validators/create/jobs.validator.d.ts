import { z } from "zod";
export declare const eligibilitySchema: z.ZodObject<{
    currency: z.ZodString;
    salary_min: z.ZodNumber;
    salary_max: z.ZodNumber;
    experience_min_years: z.ZodNumber;
    experience_ideal_years: z.ZodNumber;
    experience_max_years: z.ZodNumber;
    notice_period_ideal_days: z.ZodNumber;
    notice_period_max_days: z.ZodNumber;
    relocation_assistance: z.ZodBoolean;
    visa_sponsorship: z.ZodBoolean;
    work_authorization_required: z.ZodBoolean;
    minimum_education_level: z.ZodEnum<{
        NONE: "NONE";
        HIGH_SCHOOL: "HIGH_SCHOOL";
        DIPLOMA: "DIPLOMA";
        UNDERGRADUATE: "UNDERGRADUATE";
        POSTGRADUATE: "POSTGRADUATE";
    }>;
}, z.core.$strip>;
export declare const evaluationPrioritySchema: z.ZodObject<{
    evaluation_dimension_id: z.ZodUUID;
    weight: z.ZodNumber;
}, z.core.$strip>;
export declare const evidencePrioritySchema: z.ZodObject<{
    evidence_category_id: z.ZodUUID;
    weight: z.ZodNumber;
}, z.core.$strip>;
export declare const evaluationPrioritiesSchema: z.ZodArray<z.ZodObject<{
    evaluation_dimension_id: z.ZodUUID;
    weight: z.ZodNumber;
}, z.core.$strip>>;
export type JobEvaluationPriorityInput = z.infer<typeof evaluationPrioritySchema>;
export type JobEvaluationPrioritiesInput = z.infer<typeof evaluationPrioritiesSchema>;
export declare const evidencePrioritiesSchema: z.ZodArray<z.ZodObject<{
    evidence_category_id: z.ZodUUID;
    weight: z.ZodNumber;
}, z.core.$strip>>;
export type JobEvidencePriorityInput = z.infer<typeof evidencePrioritySchema>;
export type JobEvidencePrioritiesInput = z.infer<typeof evidencePrioritiesSchema>;
export type JobSubmissionRequirementsInput = z.infer<typeof submissionRequirementsSchema>;
export type CreateJobInput = z.infer<typeof createJobSchema>;
export declare const successSignalSchema: z.ZodObject<{
    success_signal_id: z.ZodString;
    weight: z.ZodNumber;
}, z.core.$strip>;
export declare const successSignalsSchema: z.ZodArray<z.ZodObject<{
    success_signal_id: z.ZodString;
    weight: z.ZodNumber;
}, z.core.$strip>>;
export type JobSuccessSignalInput = z.infer<typeof successSignalSchema>;
export type JobSuccessSignalsInput = z.infer<typeof successSignalsSchema>;
export type JobEligibilityCriteriaInput = z.infer<typeof eligibilitySchema>;
export declare const submissionRequirementsSchema: z.ZodObject<{
    resume_required: z.ZodBoolean;
    github_required: z.ZodBoolean;
    portfolio_required: z.ZodBoolean;
    problem_solving_profile_required: z.ZodBoolean;
    linkedin_required: z.ZodBoolean;
    project_explanation_required: z.ZodBoolean;
    feature_explanation_required: z.ZodBoolean;
    zip_upload_allowed: z.ZodBoolean;
}, z.core.$strip>;
export declare const requirementSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    requirement_type: z.ZodLiteral<"TECHNOLOGY">;
    technology_id: z.ZodUUID;
    priority_type: z.ZodEnum<{
        MANDATORY: "MANDATORY";
        PREFERRED: "PREFERRED";
        BONUS: "BONUS";
    }>;
}, z.core.$strip>, z.ZodObject<{
    requirement_type: z.ZodLiteral<"CONCEPT">;
    concept_id: z.ZodUUID;
    priority_type: z.ZodEnum<{
        MANDATORY: "MANDATORY";
        PREFERRED: "PREFERRED";
        BONUS: "BONUS";
    }>;
}, z.core.$strip>], "requirement_type">;
export declare const requirementsSchema: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
    requirement_type: z.ZodLiteral<"TECHNOLOGY">;
    technology_id: z.ZodUUID;
    priority_type: z.ZodEnum<{
        MANDATORY: "MANDATORY";
        PREFERRED: "PREFERRED";
        BONUS: "BONUS";
    }>;
}, z.core.$strip>, z.ZodObject<{
    requirement_type: z.ZodLiteral<"CONCEPT">;
    concept_id: z.ZodUUID;
    priority_type: z.ZodEnum<{
        MANDATORY: "MANDATORY";
        PREFERRED: "PREFERRED";
        BONUS: "BONUS";
    }>;
}, z.core.$strip>], "requirement_type">>;
export type JobRequirementInput = z.infer<typeof requirementSchema>;
export type JobRequirementsInput = z.infer<typeof requirementsSchema>;
export declare const createJobSchema: z.ZodObject<{
    organization_id: z.ZodUUID;
    role_category_id: z.ZodUUID;
    title: z.ZodString;
    department: z.ZodOptional<z.ZodString>;
    employment_type: z.ZodEnum<{
        FULL_TIME: "FULL_TIME";
        INTERNSHIP: "INTERNSHIP";
        CONTRACT: "CONTRACT";
        PART_TIME: "PART_TIME";
    }>;
    work_mode: z.ZodEnum<{
        ONSITE: "ONSITE";
        HYBRID: "HYBRID";
        REMOTE: "REMOTE";
    }>;
    remote_scope: z.ZodEnum<{
        NONE: "NONE";
        GLOBAL: "GLOBAL";
        COUNTRY: "COUNTRY";
        REGIONAL: "REGIONAL";
    }>;
    country: z.ZodString;
    state: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    open_positions: z.ZodNumber;
    description: z.ZodOptional<z.ZodString>;
    eligibility: z.ZodObject<{
        currency: z.ZodString;
        salary_min: z.ZodNumber;
        salary_max: z.ZodNumber;
        experience_min_years: z.ZodNumber;
        experience_ideal_years: z.ZodNumber;
        experience_max_years: z.ZodNumber;
        notice_period_ideal_days: z.ZodNumber;
        notice_period_max_days: z.ZodNumber;
        relocation_assistance: z.ZodBoolean;
        visa_sponsorship: z.ZodBoolean;
        work_authorization_required: z.ZodBoolean;
        minimum_education_level: z.ZodEnum<{
            NONE: "NONE";
            HIGH_SCHOOL: "HIGH_SCHOOL";
            DIPLOMA: "DIPLOMA";
            UNDERGRADUATE: "UNDERGRADUATE";
            POSTGRADUATE: "POSTGRADUATE";
        }>;
    }, z.core.$strip>;
    submission_requirements: z.ZodObject<{
        resume_required: z.ZodBoolean;
        github_required: z.ZodBoolean;
        portfolio_required: z.ZodBoolean;
        problem_solving_profile_required: z.ZodBoolean;
        linkedin_required: z.ZodBoolean;
        project_explanation_required: z.ZodBoolean;
        feature_explanation_required: z.ZodBoolean;
        zip_upload_allowed: z.ZodBoolean;
    }, z.core.$strip>;
    evaluation_priorities: z.ZodArray<z.ZodObject<{
        evaluation_dimension_id: z.ZodUUID;
        weight: z.ZodNumber;
    }, z.core.$strip>>;
    evidence_priorities: z.ZodArray<z.ZodObject<{
        evidence_category_id: z.ZodUUID;
        weight: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
//# sourceMappingURL=jobs.validator.d.ts.map