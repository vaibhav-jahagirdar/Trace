import { z } from "zod";
export declare const ClaimIdSchema: z.ZodString;
export type ClaimId = z.infer<typeof ClaimIdSchema>;
export declare const ConfidenceSchema: z.ZodEnum<{
    HIGH: "HIGH";
    MEDIUM: "MEDIUM";
    LOW: "LOW";
}>;
export type Confidence = z.infer<typeof ConfidenceSchema>;
export declare const TechConceptContextSchema: z.ZodEnum<{
    "Work Experience": "Work Experience";
    Project: "Project";
    "Skills Section": "Skills Section";
    Summary: "Summary";
    Other: "Other";
}>;
export type TechConceptContext = z.infer<typeof TechConceptContextSchema>;
export declare const ContextFlagSchema: z.ZodEnum<{
    AI_ASSISTED: "AI_ASSISTED";
    ACADEMIC: "ACADEMIC";
    SOLO: "SOLO";
    TEAM: "TEAM";
    TIME_CONSTRAINED: "TIME_CONSTRAINED";
}>;
export type ContextFlag = z.infer<typeof ContextFlagSchema>;
export declare const ClaimItemSchema: z.ZodObject<{
    claim_id: z.ZodString;
    text: z.ZodString;
}, z.core.$strict>;
export type ClaimItem = z.infer<typeof ClaimItemSchema>;
export declare const MetadataSchema: z.ZodObject<{
    schema_version: z.ZodDefault<z.ZodString>;
    overall_extraction_confidence: z.ZodEnum<{
        HIGH: "HIGH";
        MEDIUM: "MEDIUM";
        LOW: "LOW";
    }>;
    claim_count: z.ZodNumber;
}, z.core.$strict>;
export type Metadata = z.infer<typeof MetadataSchema>;
export declare const CandidateProfileSchema: z.ZodObject<{
    current_title: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    current_company: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    claimed_total_experience_years: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    current_location: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    summary: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    summary_claim_id: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, z.core.$strict>;
export type CandidateProfile = z.infer<typeof CandidateProfileSchema>;
export declare const WorkExperienceSchema: z.ZodObject<{
    claim_id: z.ZodString;
    company: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    role: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    start_date: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    end_date: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    current: z.ZodDefault<z.ZodBoolean>;
    domains: z.ZodDefault<z.ZodArray<z.ZodString>>;
    responsibilities: z.ZodDefault<z.ZodArray<z.ZodObject<{
        claim_id: z.ZodString;
        text: z.ZodString;
    }, z.core.$strict>>>;
    achievements: z.ZodDefault<z.ZodArray<z.ZodObject<{
        claim_id: z.ZodString;
        text: z.ZodString;
    }, z.core.$strict>>>;
    implementation_claims: z.ZodDefault<z.ZodArray<z.ZodObject<{
        claim_id: z.ZodString;
        text: z.ZodString;
    }, z.core.$strict>>>;
    technologies: z.ZodDefault<z.ZodArray<z.ZodString>>;
    concepts: z.ZodDefault<z.ZodArray<z.ZodString>>;
    context_flags: z.ZodDefault<z.ZodArray<z.ZodEnum<{
        AI_ASSISTED: "AI_ASSISTED";
        ACADEMIC: "ACADEMIC";
        SOLO: "SOLO";
        TEAM: "TEAM";
        TIME_CONSTRAINED: "TIME_CONSTRAINED";
    }>>>;
    confidence: z.ZodEnum<{
        HIGH: "HIGH";
        MEDIUM: "MEDIUM";
        LOW: "LOW";
    }>;
}, z.core.$strict>;
export type WorkExperience = z.infer<typeof WorkExperienceSchema>;
export declare const ProjectSchema: z.ZodObject<{
    claim_id: z.ZodString;
    title: z.ZodString;
    description: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    role: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    domain: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    implementation_claims: z.ZodDefault<z.ZodArray<z.ZodObject<{
        claim_id: z.ZodString;
        text: z.ZodString;
    }, z.core.$strict>>>;
    architectural_claims: z.ZodDefault<z.ZodArray<z.ZodObject<{
        claim_id: z.ZodString;
        text: z.ZodString;
    }, z.core.$strict>>>;
    major_features: z.ZodDefault<z.ZodArray<z.ZodObject<{
        claim_id: z.ZodString;
        text: z.ZodString;
    }, z.core.$strict>>>;
    technologies: z.ZodDefault<z.ZodArray<z.ZodString>>;
    concepts: z.ZodDefault<z.ZodArray<z.ZodString>>;
    repository_url: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    context_flags: z.ZodDefault<z.ZodArray<z.ZodEnum<{
        AI_ASSISTED: "AI_ASSISTED";
        ACADEMIC: "ACADEMIC";
        SOLO: "SOLO";
        TEAM: "TEAM";
        TIME_CONSTRAINED: "TIME_CONSTRAINED";
    }>>>;
    confidence: z.ZodEnum<{
        HIGH: "HIGH";
        MEDIUM: "MEDIUM";
        LOW: "LOW";
    }>;
}, z.core.$strict>;
export type Project = z.infer<typeof ProjectSchema>;
export declare const TechnologySchema: z.ZodObject<{
    claim_id: z.ZodString;
    normalized_name: z.ZodString;
    source_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
    contexts: z.ZodArray<z.ZodEnum<{
        "Work Experience": "Work Experience";
        Project: "Project";
        "Skills Section": "Skills Section";
        Summary: "Summary";
        Other: "Other";
    }>>;
}, z.core.$strict>;
export type Technology = z.infer<typeof TechnologySchema>;
export declare const ConceptSchema: z.ZodObject<{
    claim_id: z.ZodString;
    normalized_name: z.ZodString;
    source_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
    contexts: z.ZodArray<z.ZodEnum<{
        "Work Experience": "Work Experience";
        Project: "Project";
        "Skills Section": "Skills Section";
        Summary: "Summary";
        Other: "Other";
    }>>;
}, z.core.$strict>;
export type Concept = z.infer<typeof ConceptSchema>;
export declare const EducationSchema: z.ZodObject<{
    claim_id: z.ZodString;
    degree: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    specialization: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    institution: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    grade: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    start_date: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    end_date: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    current: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strict>;
export type Education = z.infer<typeof EducationSchema>;
export declare const CertificationSchema: z.ZodObject<{
    claim_id: z.ZodString;
    title: z.ZodString;
    issuer: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    issue_date: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    expiry_date: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    credential_url: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, z.core.$strict>;
export type Certification = z.infer<typeof CertificationSchema>;
export declare const LinksSchema: z.ZodObject<{
    github: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    portfolio: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, z.core.$strict>;
export type Links = z.infer<typeof LinksSchema>;
export declare const MiscellaneousClaimSchema: z.ZodObject<{
    claim_id: z.ZodString;
    category: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    title: z.ZodString;
    claim: z.ZodString;
    confidence: z.ZodEnum<{
        HIGH: "HIGH";
        MEDIUM: "MEDIUM";
        LOW: "LOW";
    }>;
}, z.core.$strict>;
export type MiscellaneousClaim = z.infer<typeof MiscellaneousClaimSchema>;
export declare const CandidateExtractionOutputSchema: z.ZodObject<{
    metadata: z.ZodObject<{
        schema_version: z.ZodDefault<z.ZodString>;
        overall_extraction_confidence: z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
        }>;
        claim_count: z.ZodNumber;
    }, z.core.$strict>;
    candidate_profile: z.ZodObject<{
        current_title: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
        current_company: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
        claimed_total_experience_years: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
        current_location: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
        summary: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
        summary_claim_id: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    }, z.core.$strict>;
    work_experience: z.ZodDefault<z.ZodArray<z.ZodObject<{
        claim_id: z.ZodString;
        company: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
        role: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
        start_date: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
        end_date: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
        current: z.ZodDefault<z.ZodBoolean>;
        domains: z.ZodDefault<z.ZodArray<z.ZodString>>;
        responsibilities: z.ZodDefault<z.ZodArray<z.ZodObject<{
            claim_id: z.ZodString;
            text: z.ZodString;
        }, z.core.$strict>>>;
        achievements: z.ZodDefault<z.ZodArray<z.ZodObject<{
            claim_id: z.ZodString;
            text: z.ZodString;
        }, z.core.$strict>>>;
        implementation_claims: z.ZodDefault<z.ZodArray<z.ZodObject<{
            claim_id: z.ZodString;
            text: z.ZodString;
        }, z.core.$strict>>>;
        technologies: z.ZodDefault<z.ZodArray<z.ZodString>>;
        concepts: z.ZodDefault<z.ZodArray<z.ZodString>>;
        context_flags: z.ZodDefault<z.ZodArray<z.ZodEnum<{
            AI_ASSISTED: "AI_ASSISTED";
            ACADEMIC: "ACADEMIC";
            SOLO: "SOLO";
            TEAM: "TEAM";
            TIME_CONSTRAINED: "TIME_CONSTRAINED";
        }>>>;
        confidence: z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
        }>;
    }, z.core.$strict>>>;
    projects: z.ZodDefault<z.ZodArray<z.ZodObject<{
        claim_id: z.ZodString;
        title: z.ZodString;
        description: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
        role: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
        domain: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
        implementation_claims: z.ZodDefault<z.ZodArray<z.ZodObject<{
            claim_id: z.ZodString;
            text: z.ZodString;
        }, z.core.$strict>>>;
        architectural_claims: z.ZodDefault<z.ZodArray<z.ZodObject<{
            claim_id: z.ZodString;
            text: z.ZodString;
        }, z.core.$strict>>>;
        major_features: z.ZodDefault<z.ZodArray<z.ZodObject<{
            claim_id: z.ZodString;
            text: z.ZodString;
        }, z.core.$strict>>>;
        technologies: z.ZodDefault<z.ZodArray<z.ZodString>>;
        concepts: z.ZodDefault<z.ZodArray<z.ZodString>>;
        repository_url: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
        context_flags: z.ZodDefault<z.ZodArray<z.ZodEnum<{
            AI_ASSISTED: "AI_ASSISTED";
            ACADEMIC: "ACADEMIC";
            SOLO: "SOLO";
            TEAM: "TEAM";
            TIME_CONSTRAINED: "TIME_CONSTRAINED";
        }>>>;
        confidence: z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
        }>;
    }, z.core.$strict>>>;
    technologies: z.ZodDefault<z.ZodArray<z.ZodObject<{
        claim_id: z.ZodString;
        normalized_name: z.ZodString;
        source_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
        contexts: z.ZodArray<z.ZodEnum<{
            "Work Experience": "Work Experience";
            Project: "Project";
            "Skills Section": "Skills Section";
            Summary: "Summary";
            Other: "Other";
        }>>;
    }, z.core.$strict>>>;
    concepts: z.ZodDefault<z.ZodArray<z.ZodObject<{
        claim_id: z.ZodString;
        normalized_name: z.ZodString;
        source_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
        contexts: z.ZodArray<z.ZodEnum<{
            "Work Experience": "Work Experience";
            Project: "Project";
            "Skills Section": "Skills Section";
            Summary: "Summary";
            Other: "Other";
        }>>;
    }, z.core.$strict>>>;
    education: z.ZodDefault<z.ZodArray<z.ZodObject<{
        claim_id: z.ZodString;
        degree: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
        specialization: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
        institution: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
        grade: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
        start_date: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
        end_date: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
        current: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strict>>>;
    certifications: z.ZodDefault<z.ZodArray<z.ZodObject<{
        claim_id: z.ZodString;
        title: z.ZodString;
        issuer: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
        issue_date: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
        expiry_date: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
        credential_url: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    }, z.core.$strict>>>;
    links: z.ZodDefault<z.ZodObject<{
        github: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
        portfolio: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    }, z.core.$strict>>;
    miscellaneous_claims: z.ZodDefault<z.ZodArray<z.ZodObject<{
        claim_id: z.ZodString;
        category: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
        title: z.ZodString;
        claim: z.ZodString;
        confidence: z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
        }>;
    }, z.core.$strict>>>;
}, z.core.$strict>;
export type CandidateExtractionOutput = z.infer<typeof CandidateExtractionOutputSchema>;
export declare function parseCandidateExtractionOutput(json: unknown): CandidateExtractionOutput;
export declare function safeParseCandidateExtractionOutput(json: unknown): z.ZodSafeParseResult<{
    metadata: {
        schema_version: string;
        overall_extraction_confidence: "HIGH" | "MEDIUM" | "LOW";
        claim_count: number;
    };
    candidate_profile: {
        current_title: string | null;
        current_company: string | null;
        claimed_total_experience_years: number | null;
        current_location: string | null;
        summary: string | null;
        summary_claim_id: string | null;
    };
    work_experience: {
        claim_id: string;
        company: string | null;
        role: string | null;
        start_date: string | null;
        end_date: string | null;
        current: boolean;
        domains: string[];
        responsibilities: {
            claim_id: string;
            text: string;
        }[];
        achievements: {
            claim_id: string;
            text: string;
        }[];
        implementation_claims: {
            claim_id: string;
            text: string;
        }[];
        technologies: string[];
        concepts: string[];
        context_flags: ("AI_ASSISTED" | "ACADEMIC" | "SOLO" | "TEAM" | "TIME_CONSTRAINED")[];
        confidence: "HIGH" | "MEDIUM" | "LOW";
    }[];
    projects: {
        claim_id: string;
        title: string;
        description: string | null;
        role: string | null;
        domain: string | null;
        implementation_claims: {
            claim_id: string;
            text: string;
        }[];
        architectural_claims: {
            claim_id: string;
            text: string;
        }[];
        major_features: {
            claim_id: string;
            text: string;
        }[];
        technologies: string[];
        concepts: string[];
        repository_url: string | null;
        context_flags: ("AI_ASSISTED" | "ACADEMIC" | "SOLO" | "TEAM" | "TIME_CONSTRAINED")[];
        confidence: "HIGH" | "MEDIUM" | "LOW";
    }[];
    technologies: {
        claim_id: string;
        normalized_name: string;
        source_claim_ids: string[];
        contexts: ("Work Experience" | "Project" | "Skills Section" | "Summary" | "Other")[];
    }[];
    concepts: {
        claim_id: string;
        normalized_name: string;
        source_claim_ids: string[];
        contexts: ("Work Experience" | "Project" | "Skills Section" | "Summary" | "Other")[];
    }[];
    education: {
        claim_id: string;
        degree: string | null;
        specialization: string | null;
        institution: string | null;
        grade: string | null;
        start_date: string | null;
        end_date: string | null;
        current: boolean;
    }[];
    certifications: {
        claim_id: string;
        title: string;
        issuer: string | null;
        issue_date: string | null;
        expiry_date: string | null;
        credential_url: string | null;
    }[];
    links: {
        github: string | null;
        portfolio: string | null;
    };
    miscellaneous_claims: {
        claim_id: string;
        category: string | null;
        title: string;
        claim: string;
        confidence: "HIGH" | "MEDIUM" | "LOW";
    }[];
}>;
//# sourceMappingURL=candidateExtraction.d.ts.map