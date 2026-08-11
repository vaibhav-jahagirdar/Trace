"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyJobResultSchema = exports.applyJobBodySchema = exports.applyJobParamsSchema = void 0;
const zod_1 = require("zod");
const educationLevelSchema = zod_1.z.enum([
    "NONE",
    "HIGH_SCHOOL",
    "DIPLOMA",
    "UNDERGRADUATE",
    "POSTGRADUATE",
]);
const applicationStatusSchema = zod_1.z.enum([
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
exports.applyJobParamsSchema = zod_1.z
    .object({
    jobId: zod_1.z.uuid(),
})
    .strict();
exports.applyJobBodySchema = zod_1.z
    .object({
    firstName: zod_1.z.string().trim().min(1).max(100),
    lastName: zod_1.z.string().trim().min(1).max(100),
    email: zod_1.z.email().trim().toLowerCase(),
    phone: zod_1.z.string().trim().max(20).optional(),
    eligibility: zod_1.z
        .object({
        yearsOfProfessionalExperience: zod_1.z.coerce.number().min(0).max(60),
        highestEducationLevel: educationLevelSchema,
        noticePeriodDays: zod_1.z.coerce.number().int().min(0).max(365),
        willingToRelocate: zod_1.z.coerce.boolean(),
        requiresVisaSponsorship: zod_1.z.coerce.boolean(),
        workAuthorized: zod_1.z.coerce.boolean(),
        currentCountry: zod_1.z.string().trim().min(1).max(100),
        currentState: zod_1.z
            .string()
            .trim()
            .min(1)
            .max(100)
            .optional(),
        currentCity: zod_1.z
            .string()
            .trim()
            .min(1)
            .max(100)
            .optional(),
    })
        .strict(),
    submission: zod_1.z
        .object({
        githubUrl: zod_1.z.url().trim().optional(),
        portfolioUrl: zod_1.z.url().trim().optional(),
        linkedinUrl: zod_1.z.url().trim().optional(),
        problemSolvingProfileUrl: zod_1.z.url().trim().optional(),
        featuredProjectName: zod_1.z.string().trim().max(255).optional(),
        featuredProjectUrl: zod_1.z.url().trim().optional(),
        projectDescription: zod_1.z.string().trim().max(4000).optional(),
        featureDescription: zod_1.z.string().trim().max(4000).optional(),
        engineeringHighlight: zod_1.z.string().trim().max(3000).optional(),
        bestEvidenceNote: zod_1.z.string().trim().max(3000).optional(),
        whyYouAreAGoodFit: zod_1.z.string().trim().max(3000).optional(),
    })
        .strict(),
    technologies: zod_1.z
        .array(zod_1.z.string().trim().min(1).max(100))
        .max(20)
        .default([])
        .transform((items) => [...new Set(items.map((item) => item.toLowerCase()))]),
    concepts: zod_1.z
        .array(zod_1.z.string().trim().min(1).max(100))
        .max(20)
        .default([])
        .transform((items) => [...new Set(items.map((item) => item.toLowerCase()))]),
})
    .strict();
exports.applyJobResultSchema = zod_1.z
    .object({
    applicationId: zod_1.z.uuid(),
    jobId: zod_1.z.uuid(),
    status: applicationStatusSchema,
    submittedAt: zod_1.z.iso.datetime(),
    rejectionReason: zod_1.z.string().nullable().optional(),
})
    .strict();
//# sourceMappingURL=validator.js.map