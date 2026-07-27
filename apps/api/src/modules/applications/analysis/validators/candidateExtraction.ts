import { z } from "zod";

export const ClaimIdSchema = z
  .string()
  .regex(/^claim_\d{4}$/, "claim_id must match ^claim_\\d{4}$");
export type ClaimId = z.infer<typeof ClaimIdSchema>;

export const ConfidenceSchema = z.enum(["HIGH", "MEDIUM", "LOW"]);
export type Confidence = z.infer<typeof ConfidenceSchema>;

export const TechConceptContextSchema = z.enum([
  "Work Experience",
  "Project",
  "Skills Section",
  "Summary",
  "Other",
]);
export type TechConceptContext = z.infer<typeof TechConceptContextSchema>;

export const ContextFlagSchema = z.enum([
  "AI_ASSISTED",
  "ACADEMIC",
  "SOLO",
  "TEAM",
  "TIME_CONSTRAINED",
]);
export type ContextFlag = z.infer<typeof ContextFlagSchema>;

export const ClaimItemSchema = z
  .object({
    claim_id: ClaimIdSchema,
    text: z.string(),
  })
  .strict();
export type ClaimItem = z.infer<typeof ClaimItemSchema>;

export const MetadataSchema = z
  .object({
    schema_version: z.string().default("v6"),
    overall_extraction_confidence: ConfidenceSchema,
    claim_count: z.number().int().nonnegative(),
  })
  .strict();
export type Metadata = z.infer<typeof MetadataSchema>;

export const CandidateProfileSchema = z
  .object({
    current_title: z.string().nullable().optional().default(null),
    current_company: z.string().nullable().optional().default(null),
    claimed_total_experience_years: z.number().nullable().optional().default(null),
    current_location: z.string().nullable().optional().default(null),
    summary: z.string().nullable().optional().default(null),
    summary_claim_id: ClaimIdSchema.nullable().optional().default(null),
  })
  .strict();
export type CandidateProfile = z.infer<typeof CandidateProfileSchema>;

export const WorkExperienceSchema = z
  .object({
    claim_id: ClaimIdSchema,
    company: z.string().nullable().optional().default(null),
    role: z.string().nullable().optional().default(null),
    start_date: z.string().nullable().optional().default(null),
    end_date: z.string().nullable().optional().default(null),
    current: z.boolean().default(false),
    domains: z.array(z.string()).default([]),
    responsibilities: z.array(ClaimItemSchema).default([]),
    achievements: z.array(ClaimItemSchema).default([]),
    implementation_claims: z.array(ClaimItemSchema).default([]),
    technologies: z.array(ClaimIdSchema).default([]),
    concepts: z.array(ClaimIdSchema).default([]),
    context_flags: z.array(ContextFlagSchema).default([]),
    confidence: ConfidenceSchema,
  })
  .strict();
export type WorkExperience = z.infer<typeof WorkExperienceSchema>;

export const ProjectSchema = z
  .object({
    claim_id: ClaimIdSchema,
    title: z.string(),
    description: z.string().nullable().optional().default(null),
    role: z.string().nullable().optional().default(null),
    domain: z.string().nullable().optional().default(null),
    implementation_claims: z.array(ClaimItemSchema).default([]),
    architectural_claims: z.array(ClaimItemSchema).default([]),
    major_features: z.array(ClaimItemSchema).default([]),
    technologies: z.array(ClaimIdSchema).default([]),
    concepts: z.array(ClaimIdSchema).default([]),
    repository_url: z.string().nullable().optional().default(null),
    context_flags: z.array(ContextFlagSchema).default([]),
    confidence: ConfidenceSchema,
  })
  .strict();
export type Project = z.infer<typeof ProjectSchema>;

const NormalizedRegistryEntryFields = {
  claim_id: ClaimIdSchema,
  normalized_name: z.string(),
  source_claim_ids: z.array(ClaimIdSchema).default([]),
  contexts: z.array(TechConceptContextSchema).min(1),
};

export const TechnologySchema = z.object(NormalizedRegistryEntryFields).strict();
export type Technology = z.infer<typeof TechnologySchema>;

export const ConceptSchema = z.object(NormalizedRegistryEntryFields).strict();
export type Concept = z.infer<typeof ConceptSchema>;

export const EducationSchema = z
  .object({
    claim_id: ClaimIdSchema,
    degree: z.string().nullable().optional().default(null),
    specialization: z.string().nullable().optional().default(null),
    institution: z.string().nullable().optional().default(null),
    grade: z.string().nullable().optional().default(null),
    start_date: z.string().nullable().optional().default(null),
    end_date: z.string().nullable().optional().default(null),
    current: z.boolean().default(false),
  })
  .strict();
export type Education = z.infer<typeof EducationSchema>;

export const CertificationSchema = z
  .object({
    claim_id: ClaimIdSchema,
    title: z.string(),
    issuer: z.string().nullable().optional().default(null),
    issue_date: z.string().nullable().optional().default(null),
    expiry_date: z.string().nullable().optional().default(null),
    credential_url: z.string().nullable().optional().default(null),
  })
  .strict();
export type Certification = z.infer<typeof CertificationSchema>;

export const LinksSchema = z
  .object({
    github: z.string().nullable().optional().default(null),
    portfolio: z.string().nullable().optional().default(null),
  })
  .strict();
export type Links = z.infer<typeof LinksSchema>;

export const MiscellaneousClaimSchema = z
  .object({
    claim_id: ClaimIdSchema,
    category: z.string().nullable().optional().default(null),
    title: z.string(),
    claim: z.string(),
    confidence: ConfidenceSchema,
  })
  .strict();
export type MiscellaneousClaim = z.infer<typeof MiscellaneousClaimSchema>;

export const CandidateExtractionOutputSchema = z
  .object({
    metadata: MetadataSchema,
    candidate_profile: CandidateProfileSchema,
    work_experience: z.array(WorkExperienceSchema).default([]),
    projects: z.array(ProjectSchema).default([]),
    technologies: z.array(TechnologySchema).default([]),
    concepts: z.array(ConceptSchema).default([]),
    education: z.array(EducationSchema).default([]),
    certifications: z.array(CertificationSchema).default([]),
    links: LinksSchema.default({ github: null, portfolio: null }),
    miscellaneous_claims: z.array(MiscellaneousClaimSchema).default([]),
  })
  .strict();

export type CandidateExtractionOutput = z.infer<typeof CandidateExtractionOutputSchema>;

export function parseCandidateExtractionOutput(json: unknown): CandidateExtractionOutput {
  return CandidateExtractionOutputSchema.parse(json);
}

export function safeParseCandidateExtractionOutput(json: unknown) {
  return CandidateExtractionOutputSchema.safeParse(json);
}