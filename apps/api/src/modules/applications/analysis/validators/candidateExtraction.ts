

import { z } from "zod";


export const ClaimIdSchema = z
  .string()
  .regex(/^claim_\d{4}$/, "claim_id must match ^claim_\\d{4}$");
export type ClaimId = z.infer<typeof ClaimIdSchema>;

export const ConfidenceSchema = z.enum(["HIGH", "MEDIUM", "LOW"]);
export type Confidence = z.infer<typeof ConfidenceSchema>;

export const ExplicitOrInferredSchema = z.enum(["EXPLICIT", "INFERRED"]);
export type ExplicitOrInferred = z.infer<typeof ExplicitOrInferredSchema>;

export const TechConceptContextSchema = z.enum([
  "Work Experience",
  "Project",
  "Skills Section",
  "Summary",
  "Other",
]);
export type TechConceptContext = z.infer<typeof TechConceptContextSchema>;

export const LinkTypeSchema = z.enum([
  "GitHub",
  "Portfolio",
  "LinkedIn",
  "Website",
  "Blog",
  "Other",
]);
export type LinkType = z.infer<typeof LinkTypeSchema>;


export const ClaimItemSchema = z
  .object({
    claim_id: ClaimIdSchema,
    text: z.string(),
    confidence: ConfidenceSchema,
    explicit_or_inferred: ExplicitOrInferredSchema,
  })
  .strict();
export type ClaimItem = z.infer<typeof ClaimItemSchema>;

export const ExtractionMetadataSchema = z
  .object({
    schema_version: z.string(),
   
    extraction_timestamp: z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
      message: "extraction_timestamp must be a valid ISO 8601 datetime string",
    }),
    parser_version: z.string(),
    overall_extraction_confidence: ConfidenceSchema,
    claim_count: z.number().int().nonnegative(),
  })
  .strict();
export type ExtractionMetadata = z.infer<typeof ExtractionMetadataSchema>;

export const CandidateProfileSchema = z
  .object({
    current_title: z.string().nullable().optional().default(null),
    current_company: z.string().nullable().optional().default(null),
    claimed_total_experience_years: z.number().nullable().optional().default(null),
    current_location: z.string().nullable().optional().default(null),
    summary: z.string().nullable().optional().default(null),
    summary_claim_id: ClaimIdSchema.nullable().optional().default(null),
    domains: z.array(z.string()).default([]),
    industries: z.array(z.string()).default([]),
    career_focus: z.string().nullable().optional().default(null),
    github_url: z.string().nullable().optional().default(null),
    portfolio_url: z.string().nullable().optional().default(null),
    linkedin_url: z.string().nullable().optional().default(null),
    website_url: z.string().nullable().optional().default(null),
  })
  .strict();
export type CandidateProfile = z.infer<typeof CandidateProfileSchema>;


export const WorkExperienceSchema = z
  .object({
    claim_id: ClaimIdSchema,
    company: z.string().nullable().optional().default(null),
    role: z.string().nullable().optional().default(null),
    employment_type: z.string().nullable().optional().default(null),
    start_date: z.string().nullable().optional().default(null),
    end_date: z.string().nullable().optional().default(null),
    current: z.boolean().default(false),
    duration: z.string().nullable().optional().default(null),
    domains: z.array(z.string()).default([]),

    responsibilities: z.array(ClaimItemSchema).default([]),
    achievements: z.array(ClaimItemSchema).default([]),

    technologies: z.array(ClaimIdSchema).default([]),
    concepts: z.array(ClaimIdSchema).default([]),

    implementation_claims: z.array(ClaimItemSchema).default([]),

    source_text: z.string(),
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
    project_type: z.string().nullable().optional().default(null),
    domain: z.string().nullable().optional().default(null),

    technologies: z.array(ClaimIdSchema).default([]),
    concepts: z.array(ClaimIdSchema).default([]),

    implementation_claims: z.array(ClaimItemSchema).default([]),
    architectural_claims: z.array(ClaimItemSchema).default([]),
    major_features: z.array(ClaimItemSchema).default([]),

    repository_url: z.string().nullable().optional().default(null),
    live_url: z.string().nullable().optional().default(null),

    source_text: z.string(),
    confidence: ConfidenceSchema,
  })
  .strict();
export type Project = z.infer<typeof ProjectSchema>;


const NormalizedRegistryEntryFields = {
  claim_id: ClaimIdSchema,
  normalized_name: z.string(),
  raw_name: z.string(),
  source_claim_ids: z.array(ClaimIdSchema).min(1),
  confidence: ConfidenceSchema,
  explicit_or_inferred: ExplicitOrInferredSchema,
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

export const AchievementSchema = z
  .object({
    claim_id: ClaimIdSchema,
    title: z.string(),
    description: z.string().nullable().optional().default(null),
    category: z.string().nullable().optional().default(null),
    source_text: z.string(),
  })
  .strict();
export type Achievement = z.infer<typeof AchievementSchema>;

export const PublicationSchema = z
  .object({
    claim_id: ClaimIdSchema,
    title: z.string(),
    publisher: z.string().nullable().optional().default(null),
    publication_date: z.string().nullable().optional().default(null),
    url: z.string().nullable().optional().default(null),
  })
  .strict();
export type Publication = z.infer<typeof PublicationSchema>;



export const LanguageSchema = z
  .object({
    language: z.string(),
    proficiency: z.string().nullable().optional().default(null),
  })
  .strict();
export type Language = z.infer<typeof LanguageSchema>;

export const LinkSchema = z
  .object({
    type: LinkTypeSchema,
    url: z.string(),
  })
  .strict();
export type Link = z.infer<typeof LinkSchema>;



export const MiscellaneousClaimSchema = z
  .object({
    claim_id: ClaimIdSchema,
    category: z.string().nullable().optional().default(null),
    title: z.string(),
    claim: z.string(),
    source_text: z.string(),
    confidence: ConfidenceSchema,
  })
  .strict();
export type MiscellaneousClaim = z.infer<typeof MiscellaneousClaimSchema>;

 

export const ExtractionReportSchema = z
  .object({
    missing_sections: z.array(z.string()).default([]),
    ambiguous_entities: z.array(z.string()).default([]),
    low_confidence_entities: z.array(ClaimIdSchema).default([]),
    duplicate_entities: z.array(z.string()).default([]),
    ignored_content: z.array(z.string()).default([]),
    parsing_notes: z.array(z.string()).default([]),
  })
  .strict();
export type ExtractionReport = z.infer<typeof ExtractionReportSchema>;



const CandidateExtractionOutputBaseSchema = z
  .object({
    metadata: ExtractionMetadataSchema,
    candidate_profile: CandidateProfileSchema,

    work_experience: z.array(WorkExperienceSchema).default([]),
    projects: z.array(ProjectSchema).default([]),

    technologies: z.array(TechnologySchema).default([]),
    concepts: z.array(ConceptSchema).default([]),

    education: z.array(EducationSchema).default([]),
    certifications: z.array(CertificationSchema).default([]),
    achievements: z.array(AchievementSchema).default([]),
    publications: z.array(PublicationSchema).default([]),

    languages: z.array(LanguageSchema).default([]),
    links: z.array(LinkSchema).default([]),

    miscellaneous_claims: z.array(MiscellaneousClaimSchema).default([]),

    extraction_report: ExtractionReportSchema,
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
  ids.push(...data.achievements.map((a) => a.claim_id));
  ids.push(...data.publications.map((p) => p.claim_id));
  ids.push(...data.miscellaneous_claims.map((m) => m.claim_id));

  return ids;
}


export const CandidateExtractionOutputSchema = CandidateExtractionOutputBaseSchema.superRefine(
  (data, ctx) => {
    const ids = collectAllClaimIds(data);

    
    const counts = new Map<string, number>();
    for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1);
    const duplicates = [...counts.entries()]
      .filter(([, n]) => n > 1)
      .map(([id]) => id)
      .sort();
    if (duplicates.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Duplicate claim_ids found: ${JSON.stringify(duplicates)}`,
        path: [],
      });
    }

   
    if (ids.length !== data.metadata.claim_count) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `metadata.claim_count (${data.metadata.claim_count}) does not match the number of claim_ids actually present (${ids.length})`,
        path: ["metadata", "claim_count"],
      });
    }


    const known = new Set(ids);
    const registries: [Array<Technology | Concept>, string, "technologies" | "concepts"][] = [
      [data.technologies, "technology", "technologies"],
      [data.concepts, "concept", "concepts"],
    ];
    for (const [registry, label, pathKey] of registries) {
      registry.forEach((entry, idx) => {
        const dangling = entry.source_claim_ids.filter((sid) => !known.has(sid));
        if (dangling.length > 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${label} '${entry.normalized_name}' (${entry.claim_id}) has source_claim_ids not present elsewhere in the extraction: ${JSON.stringify(
              dangling
            )}`,
            path: [pathKey, idx, "source_claim_ids"],
          });
        }
      });
    }
  }
);

export type CandidateExtractionOutput = z.infer<typeof CandidateExtractionOutputSchema>;


export function parseCandidateExtractionOutput(json: unknown): CandidateExtractionOutput {
  return CandidateExtractionOutputSchema.parse(json);
}



export function safeParseCandidateExtractionOutput(json: unknown) {
  return CandidateExtractionOutputSchema.safeParse(json);
}