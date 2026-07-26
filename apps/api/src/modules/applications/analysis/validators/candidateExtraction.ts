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

// ---------------------------------------------------------------------------
// ClaimItem — pydantic ClaimItem only has claim_id + text
// ---------------------------------------------------------------------------

export const ClaimItemSchema = z
  .object({
    claim_id: ClaimIdSchema,
    text: z.string(),
  })
  .strict();
export type ClaimItem = z.infer<typeof ClaimItemSchema>;

// ---------------------------------------------------------------------------
// Metadata — pydantic Metadata has no extraction_timestamp / parser_version
// ---------------------------------------------------------------------------

export const MetadataSchema = z
  .object({
    schema_version: z.string().default("v6"),
    overall_extraction_confidence: ConfidenceSchema,
    claim_count: z.number().int().nonnegative(),
  })
  .strict();
export type Metadata = z.infer<typeof MetadataSchema>;

// ---------------------------------------------------------------------------
// CandidateProfile — pydantic has no domains/industries/career_focus/urls
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// WorkExperience — pydantic has no employment_type/duration/source_text
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Project — pydantic has no project_type/live_url/source_text
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Technology / Concept — pydantic NormalizedRegistryEntry has no raw_name,
// no confidence, no explicit_or_inferred; source_claim_ids defaults to []
// (not min-length-1)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Education / Certification — match pydantic field sets exactly
// ---------------------------------------------------------------------------

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


export const CandidateExtractionOutputBaseSchema = z
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

export type CandidateExtractionOutputBase = z.infer<
  typeof CandidateExtractionOutputBaseSchema
>;

function collectAllClaimIds(data: CandidateExtractionOutputBase): string[] {
  const ids: string[] = [];

  if (data.candidate_profile.summary_claim_id) {
    ids.push(data.candidate_profile.summary_claim_id);
  }

  for (const we of data.work_experience) {
    ids.push(we.claim_id);
    ids.push(...we.responsibilities.map((c) => c.claim_id));
    ids.push(...we.achievements.map((c) => c.claim_id));
    ids.push(...we.implementation_claims.map((c) => c.claim_id));
  }

  for (const p of data.projects) {
    ids.push(p.claim_id);
    ids.push(...p.implementation_claims.map((c) => c.claim_id));
    ids.push(...p.architectural_claims.map((c) => c.claim_id));
    ids.push(...p.major_features.map((c) => c.claim_id));
  }

  ids.push(...data.technologies.map((t) => t.claim_id));
  ids.push(...data.concepts.map((c) => c.claim_id));
  ids.push(...data.education.map((e) => e.claim_id));
  ids.push(...data.certifications.map((c) => c.claim_id));
  ids.push(...data.miscellaneous_claims.map((m) => m.claim_id));

  return ids;
}

export const CandidateExtractionOutputSchema = CandidateExtractionOutputBaseSchema.superRefine(
  (data, ctx) => {
    const known = new Set(collectAllClaimIds(data));

    data.work_experience.forEach((we, weIdx) => {
      we.technologies.forEach((tid, tIdx) => {
        if (!known.has(tid)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Work experience references unknown technology claim_id: ${tid}`,
            path: ["work_experience", weIdx, "technologies", tIdx],
          });
        }
      });
      we.concepts.forEach((cid, cIdx) => {
        if (!known.has(cid)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Work experience references unknown concept claim_id: ${cid}`,
            path: ["work_experience", weIdx, "concepts", cIdx],
          });
        }
      });
    });

    data.projects.forEach((p, pIdx) => {
      p.technologies.forEach((tid, tIdx) => {
        if (!known.has(tid)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Project references unknown technology claim_id: ${tid}`,
            path: ["projects", pIdx, "technologies", tIdx],
          });
        }
      });
      p.concepts.forEach((cid, cIdx) => {
        if (!known.has(cid)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Project references unknown concept claim_id: ${cid}`,
            path: ["projects", pIdx, "concepts", cIdx],
          });
        }
      });
    });
  }
);

export type CandidateExtractionOutput = z.infer<typeof CandidateExtractionOutputSchema>;

export function parseCandidateExtractionOutput(json: unknown): CandidateExtractionOutput {
  return CandidateExtractionOutputSchema.parse(json);
}

export function safeParseCandidateExtractionOutput(json: unknown) {
  return CandidateExtractionOutputSchema.safeParse(json);
}