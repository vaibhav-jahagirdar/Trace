import { z } from "zod";
export declare const applyJobParamsSchema: z.ZodObject<{
    jobId: z.ZodUUID;
}, z.core.$strict>;
export declare const applyJobBodySchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodEmail;
    phone: z.ZodOptional<z.ZodString>;
    eligibility: z.ZodObject<{
        yearsOfProfessionalExperience: z.ZodCoercedNumber<unknown>;
        highestEducationLevel: z.ZodEnum<{
            NONE: "NONE";
            HIGH_SCHOOL: "HIGH_SCHOOL";
            DIPLOMA: "DIPLOMA";
            UNDERGRADUATE: "UNDERGRADUATE";
            POSTGRADUATE: "POSTGRADUATE";
        }>;
        noticePeriodDays: z.ZodCoercedNumber<unknown>;
        willingToRelocate: z.ZodCoercedBoolean<unknown>;
        requiresVisaSponsorship: z.ZodCoercedBoolean<unknown>;
        workAuthorized: z.ZodCoercedBoolean<unknown>;
        currentCountry: z.ZodString;
        currentState: z.ZodOptional<z.ZodString>;
        currentCity: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    submission: z.ZodObject<{
        githubUrl: z.ZodOptional<z.ZodURL>;
        portfolioUrl: z.ZodOptional<z.ZodURL>;
        linkedinUrl: z.ZodOptional<z.ZodURL>;
        problemSolvingProfileUrl: z.ZodOptional<z.ZodURL>;
        featuredProjectName: z.ZodOptional<z.ZodString>;
        featuredProjectUrl: z.ZodOptional<z.ZodURL>;
        projectDescription: z.ZodOptional<z.ZodString>;
        featureDescription: z.ZodOptional<z.ZodString>;
        engineeringHighlight: z.ZodOptional<z.ZodString>;
        bestEvidenceNote: z.ZodOptional<z.ZodString>;
        whyYouAreAGoodFit: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    technologies: z.ZodPipe<z.ZodDefault<z.ZodArray<z.ZodString>>, z.ZodTransform<string[], string[]>>;
    concepts: z.ZodPipe<z.ZodDefault<z.ZodArray<z.ZodString>>, z.ZodTransform<string[], string[]>>;
}, z.core.$strict>;
export declare const applyJobResultSchema: z.ZodObject<{
    applicationId: z.ZodUUID;
    jobId: z.ZodUUID;
    status: z.ZodEnum<{
        SUBMITTED: "SUBMITTED";
        QUEUED: "QUEUED";
        UNDER_REVIEW: "UNDER_REVIEW";
        SHORTLISTED: "SHORTLISTED";
        INTERVIEW: "INTERVIEW";
        OFFERED: "OFFERED";
        HIRED: "HIRED";
        REJECTED: "REJECTED";
        WITHDRAWN: "WITHDRAWN";
    }>;
    submittedAt: z.ZodISODateTime;
    rejectionReason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strict>;
export type ApplyJobParams = z.infer<typeof applyJobParamsSchema>;
export type ApplyJobBody = z.infer<typeof applyJobBodySchema>;
export type ApplyJobResult = z.infer<typeof applyJobResultSchema>;
//# sourceMappingURL=validator.d.ts.map