import { z } from "zod";

export const eligibilitySchema = z
  .object({
    currency: z
      .string()
      .trim()
      .min(1)
      .max(10),

    salary_min: z
      .number()
      .nonnegative(),

    salary_max: z
      .number()
      .nonnegative(),

    experience_min_years: z
      .number()
      .min(0),

    experience_ideal_years: z
      .number()
      .min(0),

    experience_max_years: z
      .number()
      .min(0),

    notice_period_ideal_days: z
      .number()
      .int()
      .min(0),

    notice_period_max_days: z
      .number()
      .int()
      .min(0),

    relocation_supported:
      z.boolean(),

    visa_sponsorship:
      z.boolean(),

    work_authorization_required:
      z.boolean(),
    
   minimum_education_level: z.enum([
    "NONE",
    "HIGH_SCHOOL",
    "DIPLOMA",
    "UNDERGRADUATE",
    "POSTGRADUATE",

   ]

   )

   
  })
  .superRefine((data, ctx) => {
    if (data.salary_min > data.salary_max) {
      ctx.addIssue({
        code: "custom",
        path: ["salary_max"],
        message:
          "salary_max must be greater than or equal to salary_min",
      });
    }

    if (
      data.experience_min_years >
      data.experience_ideal_years
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["experience_ideal_years"],
        message:
          "experience_ideal_years must be greater than or equal to experience_min_years",
      });
    }

    if (
      data.experience_ideal_years >
      data.experience_max_years
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["experience_max_years"],
        message:
          "experience_max_years must be greater than or equal to experience_ideal_years",
      });
    }

    if (
      data.notice_period_ideal_days >
      data.notice_period_max_days
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["notice_period_max_days"],
        message:
          "notice_period_max_days must be greater than or equal to notice_period_ideal_days",
      });
    }
  });
export const submissionRequirementsSchema = z.object({
  resume_required: z.boolean(),

  github_required: z.boolean(),

  portfolio_required: z.boolean(),

  problem_solving_profile_required:
    z.boolean(),

  linkedin_required:
    z.boolean(),

  project_explanation_required:
    z.boolean(),

  feature_explanation_required:
    z.boolean(),

  zip_upload_allowed:
    z.boolean(),
});
const technologyRequirementSchema =
  z.object({
    requirement_type: z.literal(
      "TECHNOLOGY"
    ),

    technology_id: z.uuid(),

    priority_type: z.enum([
      "MANDATORY",
      "PREFERRED",
      "BONUS",
    ]),

    weight: z
      .number()
      .int()
      .positive(),
  });

const conceptRequirementSchema =
  z.object({
    requirement_type: z.literal(
      "CONCEPT"
    ),

    concept_id: z.uuid(),

    priority_type: z.enum([
      "MANDATORY",
      "PREFERRED",
      "BONUS",
    ]),

    weight: z
      .number()
      .int()
      .positive(),
  });

export const requirementSchema =
  z.discriminatedUnion(
    "requirement_type",
    [
      technologyRequirementSchema,
      conceptRequirementSchema,
    ]
  );

export const requirementsSchema =
  z.array(requirementSchema);

export type JobRequirementInput =
  z.infer<
    typeof requirementSchema
  >;

export type JobRequirementsInput =
  z.infer<
    typeof requirementsSchema
  >;
export const createJobSchema = z.object({
  organization_id: z.uuid(),

  role_category_id: z.uuid(),

  title: z
    .string()
    .trim()
    .min(1)
    .max(255),

  department: z
    .string()
    .trim()
    .max(150)
    .optional(),

  employment_type: z.enum([
    "FULL_TIME",
    "INTERNSHIP",
    "CONTRACT",
    "PART_TIME",
  ]),

  work_mode: z.enum([
    "ONSITE",
    "HYBRID",
    "REMOTE",
  ]),

  country: z
    .string()
    .trim()
    .min(1)
    .max(100),

  state: z
    .string()
    .trim()
    .max(100)
    .optional(),

  city: z
    .string()
    .trim()
    .max(100)
    .optional(),

  open_positions: z
    .number()
    .int()
    .positive(),

  description: z
    .string()
    .trim()
    .max(10000)
    .optional(),

  eligibility: eligibilitySchema,
  submission_requirements: submissionRequirementsSchema
});


export type JobSubmissionRequirementsInput =
  z.infer<typeof submissionRequirementsSchema>;

export type CreateJobInput =
  z.infer<typeof createJobSchema>;

  export type JobEligibilityCriteriaInput =  z.infer<typeof eligibilitySchema>