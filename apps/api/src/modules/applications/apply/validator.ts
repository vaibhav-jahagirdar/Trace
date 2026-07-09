import { z } from "zod";

const educationLevelSchema = z.enum([
  "NONE",
  "HIGH_SCHOOL",
  "DIPLOMA",
  "UNDERGRADUATE",
  "POSTGRADUATE",
]);

const applicationStatusSchema = z.enum([
  "SUBMITTED",
  "QUEUED",
  "UNDER_REVIEW",
  "SHORTLISTED",
  "INTERVIEW",
  "OFFERED",
  "HIRED",
  "REJECTED",
  "WITHDRAWN",
]);

export const applyJobParamsSchema = z
  .object({
    jobId: z.uuid(),
  })
  .strict();

export const applyJobBodySchema = z
  .object({
    firstName: z.string().trim().min(1).max(100),

    lastName: z.string().trim().min(1).max(100),

    email: z.email().trim().toLowerCase(),

    phone: z.string().trim().max(20).optional(),

   eligibility: z
  .object({
    yearsOfProfessionalExperience: z.coerce.number().min(0).max(60),

    highestEducationLevel: educationLevelSchema,

    noticePeriodDays: z.coerce.number().int().min(0).max(365),

    willingToRelocate: z.coerce.boolean(),

    requiresVisaSponsorship: z.coerce.boolean(),

    workAuthorized: z.coerce.boolean(),

    currentCountry: z.string().trim().min(1).max(100),

    currentState: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .optional(),

    currentCity: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .optional(),
  })
  .strict(),
  
    submission: z
      .object({
        githubUrl: z.url().trim().optional(),

        portfolioUrl: z.url().trim().optional(),

        linkedinUrl: z.url().trim().optional(),

        problemSolvingProfileUrl: z.url().trim().optional(),

        featuredProjectName: z.string().trim().max(255).optional(),

        featuredProjectUrl: z.url().trim().optional(),

        projectDescription: z.string().trim().max(4000).optional(),

        featureDescription: z.string().trim().max(4000).optional(),

        engineeringHighlight: z.string().trim().max(3000).optional(),

        bestEvidenceNote: z.string().trim().max(3000).optional(),

        whyYouAreAGoodFit: z.string().trim().max(3000).optional(),
      })
      .strict(),

    technologies: z
      .array(z.string().trim().min(1).max(100))
      .max(20)
      .default([])
      .transform((items) =>
        [...new Set(items.map((item) => item.toLowerCase()))],
      ),

    concepts: z
      .array(z.string().trim().min(1).max(100))
      .max(20)
      .default([])
      .transform((items) =>
        [...new Set(items.map((item) => item.toLowerCase()))],
      ),
  })
  .strict();

export const applyJobResultSchema = z
  .object({
    applicationId: z.uuid(),

    jobId: z.uuid(),

    status: applicationStatusSchema,

    submittedAt: z.iso.datetime(),

    rejectionReason: z.string().nullable().optional(),
  })
  .strict();

export type ApplyJobParams = z.infer<typeof applyJobParamsSchema>;
export type ApplyJobBody = z.infer<typeof applyJobBodySchema>;
export type ApplyJobResult = z.infer<typeof applyJobResultSchema>;