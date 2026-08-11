"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CandidateExtractionOutputSchema = exports.MiscellaneousClaimSchema = exports.LinksSchema = exports.CertificationSchema = exports.EducationSchema = exports.ConceptSchema = exports.TechnologySchema = exports.ProjectSchema = exports.WorkExperienceSchema = exports.CandidateProfileSchema = exports.MetadataSchema = exports.ClaimItemSchema = exports.ContextFlagSchema = exports.TechConceptContextSchema = exports.ConfidenceSchema = exports.ClaimIdSchema = void 0;
exports.parseCandidateExtractionOutput = parseCandidateExtractionOutput;
exports.safeParseCandidateExtractionOutput = safeParseCandidateExtractionOutput;
const zod_1 = require("zod");
exports.ClaimIdSchema = zod_1.z
    .string()
    .regex(/^claim_\d{4}$/, "claim_id must match ^claim_\\d{4}$");
exports.ConfidenceSchema = zod_1.z.enum(["HIGH", "MEDIUM", "LOW"]);
exports.TechConceptContextSchema = zod_1.z.enum([
    "Work Experience",
    "Project",
    "Skills Section",
    "Summary",
    "Other",
]);
exports.ContextFlagSchema = zod_1.z.enum([
    "AI_ASSISTED",
    "ACADEMIC",
    "SOLO",
    "TEAM",
    "TIME_CONSTRAINED",
]);
exports.ClaimItemSchema = zod_1.z
    .object({
    claim_id: exports.ClaimIdSchema,
    text: zod_1.z.string(),
})
    .strict();
exports.MetadataSchema = zod_1.z
    .object({
    schema_version: zod_1.z.string().default("v6"),
    overall_extraction_confidence: exports.ConfidenceSchema,
    claim_count: zod_1.z.number().int().nonnegative(),
})
    .strict();
exports.CandidateProfileSchema = zod_1.z
    .object({
    current_title: zod_1.z.string().nullable().optional().default(null),
    current_company: zod_1.z.string().nullable().optional().default(null),
    claimed_total_experience_years: zod_1.z.number().nullable().optional().default(null),
    current_location: zod_1.z.string().nullable().optional().default(null),
    summary: zod_1.z.string().nullable().optional().default(null),
    summary_claim_id: exports.ClaimIdSchema.nullable().optional().default(null),
})
    .strict();
exports.WorkExperienceSchema = zod_1.z
    .object({
    claim_id: exports.ClaimIdSchema,
    company: zod_1.z.string().nullable().optional().default(null),
    role: zod_1.z.string().nullable().optional().default(null),
    start_date: zod_1.z.string().nullable().optional().default(null),
    end_date: zod_1.z.string().nullable().optional().default(null),
    current: zod_1.z.boolean().default(false),
    domains: zod_1.z.array(zod_1.z.string()).default([]),
    responsibilities: zod_1.z.array(exports.ClaimItemSchema).default([]),
    achievements: zod_1.z.array(exports.ClaimItemSchema).default([]),
    implementation_claims: zod_1.z.array(exports.ClaimItemSchema).default([]),
    technologies: zod_1.z.array(exports.ClaimIdSchema).default([]),
    concepts: zod_1.z.array(exports.ClaimIdSchema).default([]),
    context_flags: zod_1.z.array(exports.ContextFlagSchema).default([]),
    confidence: exports.ConfidenceSchema,
})
    .strict();
exports.ProjectSchema = zod_1.z
    .object({
    claim_id: exports.ClaimIdSchema,
    title: zod_1.z.string(),
    description: zod_1.z.string().nullable().optional().default(null),
    role: zod_1.z.string().nullable().optional().default(null),
    domain: zod_1.z.string().nullable().optional().default(null),
    implementation_claims: zod_1.z.array(exports.ClaimItemSchema).default([]),
    architectural_claims: zod_1.z.array(exports.ClaimItemSchema).default([]),
    major_features: zod_1.z.array(exports.ClaimItemSchema).default([]),
    technologies: zod_1.z.array(exports.ClaimIdSchema).default([]),
    concepts: zod_1.z.array(exports.ClaimIdSchema).default([]),
    repository_url: zod_1.z.string().nullable().optional().default(null),
    context_flags: zod_1.z.array(exports.ContextFlagSchema).default([]),
    confidence: exports.ConfidenceSchema,
})
    .strict();
const NormalizedRegistryEntryFields = {
    claim_id: exports.ClaimIdSchema,
    normalized_name: zod_1.z.string(),
    source_claim_ids: zod_1.z.array(exports.ClaimIdSchema).default([]),
    contexts: zod_1.z.array(exports.TechConceptContextSchema).min(1),
};
exports.TechnologySchema = zod_1.z.object(NormalizedRegistryEntryFields).strict();
exports.ConceptSchema = zod_1.z.object(NormalizedRegistryEntryFields).strict();
exports.EducationSchema = zod_1.z
    .object({
    claim_id: exports.ClaimIdSchema,
    degree: zod_1.z.string().nullable().optional().default(null),
    specialization: zod_1.z.string().nullable().optional().default(null),
    institution: zod_1.z.string().nullable().optional().default(null),
    grade: zod_1.z.string().nullable().optional().default(null),
    start_date: zod_1.z.string().nullable().optional().default(null),
    end_date: zod_1.z.string().nullable().optional().default(null),
    current: zod_1.z.boolean().default(false),
})
    .strict();
exports.CertificationSchema = zod_1.z
    .object({
    claim_id: exports.ClaimIdSchema,
    title: zod_1.z.string(),
    issuer: zod_1.z.string().nullable().optional().default(null),
    issue_date: zod_1.z.string().nullable().optional().default(null),
    expiry_date: zod_1.z.string().nullable().optional().default(null),
    credential_url: zod_1.z.string().nullable().optional().default(null),
})
    .strict();
exports.LinksSchema = zod_1.z
    .object({
    github: zod_1.z.string().nullable().optional().default(null),
    portfolio: zod_1.z.string().nullable().optional().default(null),
})
    .strict();
exports.MiscellaneousClaimSchema = zod_1.z
    .object({
    claim_id: exports.ClaimIdSchema,
    category: zod_1.z.string().nullable().optional().default(null),
    title: zod_1.z.string(),
    claim: zod_1.z.string(),
    confidence: exports.ConfidenceSchema,
})
    .strict();
exports.CandidateExtractionOutputSchema = zod_1.z
    .object({
    metadata: exports.MetadataSchema,
    candidate_profile: exports.CandidateProfileSchema,
    work_experience: zod_1.z.array(exports.WorkExperienceSchema).default([]),
    projects: zod_1.z.array(exports.ProjectSchema).default([]),
    technologies: zod_1.z.array(exports.TechnologySchema).default([]),
    concepts: zod_1.z.array(exports.ConceptSchema).default([]),
    education: zod_1.z.array(exports.EducationSchema).default([]),
    certifications: zod_1.z.array(exports.CertificationSchema).default([]),
    links: exports.LinksSchema.default({ github: null, portfolio: null }),
    miscellaneous_claims: zod_1.z.array(exports.MiscellaneousClaimSchema).default([]),
})
    .strict();
function parseCandidateExtractionOutput(json) {
    return exports.CandidateExtractionOutputSchema.parse(json);
}
function safeParseCandidateExtractionOutput(json) {
    return exports.CandidateExtractionOutputSchema.safeParse(json);
}
//# sourceMappingURL=candidateExtraction.js.map