import { z } from "zod";
export declare const ClaimIdSchema: z.ZodString;
export type ClaimId = z.infer<typeof ClaimIdSchema>;
export declare const RatingSchema: z.ZodEnum<{
    HIGH: "HIGH";
    MEDIUM: "MEDIUM";
    LOW: "LOW";
    VERY_LOW: "VERY_LOW";
    VERY_HIGH: "VERY_HIGH";
    UNDETERMINABLE: "UNDETERMINABLE";
}>;
export type Rating = z.infer<typeof RatingSchema>;
export declare const ConfidenceSchema: z.ZodEnum<{
    HIGH: "HIGH";
    MEDIUM: "MEDIUM";
    LOW: "LOW";
}>;
export type Confidence = z.infer<typeof ConfidenceSchema>;
export declare const PriorityTypeSchema: z.ZodEnum<{
    MANDATORY: "MANDATORY";
    PREFERRED: "PREFERRED";
    BONUS: "BONUS";
}>;
export type PriorityType = z.infer<typeof PriorityTypeSchema>;
export declare const RequirementStatusSchema: z.ZodEnum<{
    CONFIRMED: "CONFIRMED";
    UNCONFIRMED: "UNCONFIRMED";
    MISSING: "MISSING";
}>;
export type RequirementStatus = z.infer<typeof RequirementStatusSchema>;
export declare const ClaimTypeSchema: z.ZodEnum<{
    RESPONSIBILITY: "RESPONSIBILITY";
    ACHIEVEMENT: "ACHIEVEMENT";
    IMPLEMENTATION: "IMPLEMENTATION";
    ARCHITECTURAL: "ARCHITECTURAL";
    MAJOR_FEATURE: "MAJOR_FEATURE";
}>;
export type ClaimType = z.infer<typeof ClaimTypeSchema>;
export declare const ImportanceSchema: z.ZodEnum<{
    HIGH: "HIGH";
    MEDIUM: "MEDIUM";
    CRITICAL: "CRITICAL";
}>;
export type Importance = z.infer<typeof ImportanceSchema>;
export declare const ExperienceSourceSchema: z.ZodEnum<{
    WORK: "WORK";
    PROJECT: "PROJECT";
}>;
export type ExperienceSource = z.infer<typeof ExperienceSourceSchema>;
export declare const AlignmentRatingSchema: z.ZodEnum<{
    HIGH: "HIGH";
    MEDIUM: "MEDIUM";
    LOW: "LOW";
    UNDETERMINABLE: "UNDETERMINABLE";
}>;
export type AlignmentRating = z.infer<typeof AlignmentRatingSchema>;
export declare const OverallRoleFitSchema: z.ZodEnum<{
    EXCEPTIONAL: "EXCEPTIONAL";
    STRONG: "STRONG";
    GOOD: "GOOD";
    MODERATE: "MODERATE";
    WEAK: "WEAK";
    POOR: "POOR";
}>;
export type OverallRoleFit = z.infer<typeof OverallRoleFitSchema>;
export declare const RepositoryPrioritySchema: z.ZodEnum<{
    HIGH: "HIGH";
    MEDIUM: "MEDIUM";
    LOW: "LOW";
    CRITICAL: "CRITICAL";
}>;
export type RepositoryPriority = z.infer<typeof RepositoryPrioritySchema>;
export declare const ImpactSchema: z.ZodEnum<{
    HIGH: "HIGH";
    MEDIUM: "MEDIUM";
    LOW: "LOW";
}>;
export type Impact = z.infer<typeof ImpactSchema>;
export declare const ScoredFieldSchema: z.ZodObject<{
    rating: z.ZodEnum<{
        HIGH: "HIGH";
        MEDIUM: "MEDIUM";
        LOW: "LOW";
        VERY_LOW: "VERY_LOW";
        VERY_HIGH: "VERY_HIGH";
        UNDETERMINABLE: "UNDETERMINABLE";
    }>;
    score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    confidence: z.ZodEnum<{
        HIGH: "HIGH";
        MEDIUM: "MEDIUM";
        LOW: "LOW";
    }>;
    summary: z.ZodString;
    supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strict>;
export type ScoredField = z.infer<typeof ScoredFieldSchema>;
export declare const ScoreRatingSchema: z.ZodObject<{
    score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    rating: z.ZodEnum<{
        HIGH: "HIGH";
        MEDIUM: "MEDIUM";
        LOW: "LOW";
        VERY_LOW: "VERY_LOW";
        VERY_HIGH: "VERY_HIGH";
        UNDETERMINABLE: "UNDETERMINABLE";
    }>;
    confidence: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodEnum<{
        HIGH: "HIGH";
        MEDIUM: "MEDIUM";
        LOW: "LOW";
    }>>>>;
    supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strict>;
export type ScoreRating = z.infer<typeof ScoreRatingSchema>;
export declare const DualAxisScoredFieldSchema: z.ZodObject<{
    source_type: z.ZodEnum<{
        WORK: "WORK";
        PROJECT: "PROJECT";
    }>;
    relevance: z.ZodObject<{
        score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
        rating: z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
            VERY_LOW: "VERY_LOW";
            VERY_HIGH: "VERY_HIGH";
            UNDETERMINABLE: "UNDETERMINABLE";
        }>;
        confidence: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
        }>>>>;
        supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>;
    quality: z.ZodObject<{
        score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
        rating: z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
            VERY_LOW: "VERY_LOW";
            VERY_HIGH: "VERY_HIGH";
            UNDETERMINABLE: "UNDETERMINABLE";
        }>;
        confidence: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
        }>>>>;
        supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>;
    score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    rating: z.ZodEnum<{
        HIGH: "HIGH";
        MEDIUM: "MEDIUM";
        LOW: "LOW";
        VERY_LOW: "VERY_LOW";
        VERY_HIGH: "VERY_HIGH";
        UNDETERMINABLE: "UNDETERMINABLE";
    }>;
    confidence: z.ZodEnum<{
        HIGH: "HIGH";
        MEDIUM: "MEDIUM";
        LOW: "LOW";
    }>;
    summary: z.ZodString;
    supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strict>;
export type DualAxisScoredField = z.infer<typeof DualAxisScoredFieldSchema>;
export declare const TechnologyAlignmentSchema: z.ZodIntersection<z.ZodObject<{
    rating: z.ZodEnum<{
        HIGH: "HIGH";
        MEDIUM: "MEDIUM";
        LOW: "LOW";
        VERY_LOW: "VERY_LOW";
        VERY_HIGH: "VERY_HIGH";
        UNDETERMINABLE: "UNDETERMINABLE";
    }>;
    score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    confidence: z.ZodEnum<{
        HIGH: "HIGH";
        MEDIUM: "MEDIUM";
        LOW: "LOW";
    }>;
    summary: z.ZodString;
    supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strict>, z.ZodObject<{
    mandatory_technologies_present: z.ZodBoolean;
}, z.core.$strict>>;
export type TechnologyAlignment = z.infer<typeof TechnologyAlignmentSchema>;
export declare const QualificationAlignmentSchema: z.ZodIntersection<z.ZodObject<{
    rating: z.ZodEnum<{
        HIGH: "HIGH";
        MEDIUM: "MEDIUM";
        LOW: "LOW";
        VERY_LOW: "VERY_LOW";
        VERY_HIGH: "VERY_HIGH";
        UNDETERMINABLE: "UNDETERMINABLE";
    }>;
    score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    confidence: z.ZodEnum<{
        HIGH: "HIGH";
        MEDIUM: "MEDIUM";
        LOW: "LOW";
    }>;
    summary: z.ZodString;
    supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strict>, z.ZodObject<{
    mandatory_qualifications_present: z.ZodBoolean;
}, z.core.$strict>>;
export type QualificationAlignment = z.infer<typeof QualificationAlignmentSchema>;
export declare const SupportingSignalItemSchema: z.ZodObject<{
    code: z.ZodString;
    priority_type: z.ZodEnum<{
        MANDATORY: "MANDATORY";
        PREFERRED: "PREFERRED";
        BONUS: "BONUS";
    }>;
    rating: z.ZodEnum<{
        HIGH: "HIGH";
        MEDIUM: "MEDIUM";
        LOW: "LOW";
        VERY_LOW: "VERY_LOW";
        VERY_HIGH: "VERY_HIGH";
        UNDETERMINABLE: "UNDETERMINABLE";
    }>;
    score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    note: z.ZodString;
    supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strict>;
export type SupportingSignalItem = z.infer<typeof SupportingSignalItemSchema>;
export declare const SupportingSignalsSchema: z.ZodIntersection<z.ZodObject<{
    rating: z.ZodEnum<{
        HIGH: "HIGH";
        MEDIUM: "MEDIUM";
        LOW: "LOW";
        VERY_LOW: "VERY_LOW";
        VERY_HIGH: "VERY_HIGH";
        UNDETERMINABLE: "UNDETERMINABLE";
    }>;
    score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    confidence: z.ZodEnum<{
        HIGH: "HIGH";
        MEDIUM: "MEDIUM";
        LOW: "LOW";
    }>;
    summary: z.ZodString;
    supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strict>, z.ZodObject<{
    signals: z.ZodDefault<z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        priority_type: z.ZodEnum<{
            MANDATORY: "MANDATORY";
            PREFERRED: "PREFERRED";
            BONUS: "BONUS";
        }>;
        rating: z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
            VERY_LOW: "VERY_LOW";
            VERY_HIGH: "VERY_HIGH";
            UNDETERMINABLE: "UNDETERMINABLE";
        }>;
        score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
        note: z.ZodString;
        supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>>>;
}, z.core.$strict>>;
export type SupportingSignals = z.infer<typeof SupportingSignalsSchema>;
export declare const BucketScoresSchema: z.ZodObject<{
    primary_evidence: z.ZodObject<{
        source_type: z.ZodEnum<{
            WORK: "WORK";
            PROJECT: "PROJECT";
        }>;
        relevance: z.ZodObject<{
            score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
            rating: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
                VERY_LOW: "VERY_LOW";
                VERY_HIGH: "VERY_HIGH";
                UNDETERMINABLE: "UNDETERMINABLE";
            }>;
            confidence: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
            }>>>>;
            supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>;
        quality: z.ZodObject<{
            score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
            rating: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
                VERY_LOW: "VERY_LOW";
                VERY_HIGH: "VERY_HIGH";
                UNDETERMINABLE: "UNDETERMINABLE";
            }>;
            confidence: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
            }>>>>;
            supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>;
        score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
        rating: z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
            VERY_LOW: "VERY_LOW";
            VERY_HIGH: "VERY_HIGH";
            UNDETERMINABLE: "UNDETERMINABLE";
        }>;
        confidence: z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
        }>;
        summary: z.ZodString;
        supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>;
    secondary_evidence: z.ZodObject<{
        source_type: z.ZodEnum<{
            WORK: "WORK";
            PROJECT: "PROJECT";
        }>;
        relevance: z.ZodObject<{
            score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
            rating: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
                VERY_LOW: "VERY_LOW";
                VERY_HIGH: "VERY_HIGH";
                UNDETERMINABLE: "UNDETERMINABLE";
            }>;
            confidence: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
            }>>>>;
            supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>;
        quality: z.ZodObject<{
            score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
            rating: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
                VERY_LOW: "VERY_LOW";
                VERY_HIGH: "VERY_HIGH";
                UNDETERMINABLE: "UNDETERMINABLE";
            }>;
            confidence: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
            }>>>>;
            supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>;
        score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
        rating: z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
            VERY_LOW: "VERY_LOW";
            VERY_HIGH: "VERY_HIGH";
            UNDETERMINABLE: "UNDETERMINABLE";
        }>;
        confidence: z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
        }>;
        summary: z.ZodString;
        supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>;
    concept_alignment: z.ZodObject<{
        rating: z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
            VERY_LOW: "VERY_LOW";
            VERY_HIGH: "VERY_HIGH";
            UNDETERMINABLE: "UNDETERMINABLE";
        }>;
        score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
        confidence: z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
        }>;
        summary: z.ZodString;
        supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>;
    technology_alignment: z.ZodIntersection<z.ZodObject<{
        rating: z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
            VERY_LOW: "VERY_LOW";
            VERY_HIGH: "VERY_HIGH";
            UNDETERMINABLE: "UNDETERMINABLE";
        }>;
        score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
        confidence: z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
        }>;
        summary: z.ZodString;
        supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>, z.ZodObject<{
        mandatory_technologies_present: z.ZodBoolean;
    }, z.core.$strict>>;
    qualification_alignment: z.ZodIntersection<z.ZodObject<{
        rating: z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
            VERY_LOW: "VERY_LOW";
            VERY_HIGH: "VERY_HIGH";
            UNDETERMINABLE: "UNDETERMINABLE";
        }>;
        score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
        confidence: z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
        }>;
        summary: z.ZodString;
        supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>, z.ZodObject<{
        mandatory_qualifications_present: z.ZodBoolean;
    }, z.core.$strict>>;
    supporting_signals: z.ZodIntersection<z.ZodObject<{
        rating: z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
            VERY_LOW: "VERY_LOW";
            VERY_HIGH: "VERY_HIGH";
            UNDETERMINABLE: "UNDETERMINABLE";
        }>;
        score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
        confidence: z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
        }>;
        summary: z.ZodString;
        supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>, z.ZodObject<{
        signals: z.ZodDefault<z.ZodArray<z.ZodObject<{
            code: z.ZodString;
            priority_type: z.ZodEnum<{
                MANDATORY: "MANDATORY";
                PREFERRED: "PREFERRED";
                BONUS: "BONUS";
            }>;
            rating: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
                VERY_LOW: "VERY_LOW";
                VERY_HIGH: "VERY_HIGH";
                UNDETERMINABLE: "UNDETERMINABLE";
            }>;
            score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
            note: z.ZodString;
            supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type BucketScores = z.infer<typeof BucketScoresSchema>;
export declare const RequirementAssessmentSchema: z.ZodObject<{
    name: z.ZodString;
    status: z.ZodEnum<{
        CONFIRMED: "CONFIRMED";
        UNCONFIRMED: "UNCONFIRMED";
        MISSING: "MISSING";
    }>;
    supporting_claim_ids: z.ZodArray<z.ZodString>;
    note: z.ZodString;
}, z.core.$strict>;
export type RequirementAssessment = z.infer<typeof RequirementAssessmentSchema>;
export declare const RequirementCategorySchema: z.ZodObject<{
    technologies: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        status: z.ZodEnum<{
            CONFIRMED: "CONFIRMED";
            UNCONFIRMED: "UNCONFIRMED";
            MISSING: "MISSING";
        }>;
        supporting_claim_ids: z.ZodArray<z.ZodString>;
        note: z.ZodString;
    }, z.core.$strict>>>;
    concepts: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        status: z.ZodEnum<{
            CONFIRMED: "CONFIRMED";
            UNCONFIRMED: "UNCONFIRMED";
            MISSING: "MISSING";
        }>;
        supporting_claim_ids: z.ZodArray<z.ZodString>;
        note: z.ZodString;
    }, z.core.$strict>>>;
    qualifications: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        status: z.ZodEnum<{
            CONFIRMED: "CONFIRMED";
            UNCONFIRMED: "UNCONFIRMED";
            MISSING: "MISSING";
        }>;
        supporting_claim_ids: z.ZodArray<z.ZodString>;
        note: z.ZodString;
    }, z.core.$strict>>>;
}, z.core.$strict>;
export type RequirementCategory = z.infer<typeof RequirementCategorySchema>;
export declare const RequirementAnalysisSchema: z.ZodObject<{
    mandatory: z.ZodObject<{
        technologies: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            status: z.ZodEnum<{
                CONFIRMED: "CONFIRMED";
                UNCONFIRMED: "UNCONFIRMED";
                MISSING: "MISSING";
            }>;
            supporting_claim_ids: z.ZodArray<z.ZodString>;
            note: z.ZodString;
        }, z.core.$strict>>>;
        concepts: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            status: z.ZodEnum<{
                CONFIRMED: "CONFIRMED";
                UNCONFIRMED: "UNCONFIRMED";
                MISSING: "MISSING";
            }>;
            supporting_claim_ids: z.ZodArray<z.ZodString>;
            note: z.ZodString;
        }, z.core.$strict>>>;
        qualifications: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            status: z.ZodEnum<{
                CONFIRMED: "CONFIRMED";
                UNCONFIRMED: "UNCONFIRMED";
                MISSING: "MISSING";
            }>;
            supporting_claim_ids: z.ZodArray<z.ZodString>;
            note: z.ZodString;
        }, z.core.$strict>>>;
    }, z.core.$strict>;
    preferred: z.ZodObject<{
        technologies: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            status: z.ZodEnum<{
                CONFIRMED: "CONFIRMED";
                UNCONFIRMED: "UNCONFIRMED";
                MISSING: "MISSING";
            }>;
            supporting_claim_ids: z.ZodArray<z.ZodString>;
            note: z.ZodString;
        }, z.core.$strict>>>;
        concepts: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            status: z.ZodEnum<{
                CONFIRMED: "CONFIRMED";
                UNCONFIRMED: "UNCONFIRMED";
                MISSING: "MISSING";
            }>;
            supporting_claim_ids: z.ZodArray<z.ZodString>;
            note: z.ZodString;
        }, z.core.$strict>>>;
        qualifications: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            status: z.ZodEnum<{
                CONFIRMED: "CONFIRMED";
                UNCONFIRMED: "UNCONFIRMED";
                MISSING: "MISSING";
            }>;
            supporting_claim_ids: z.ZodArray<z.ZodString>;
            note: z.ZodString;
        }, z.core.$strict>>>;
    }, z.core.$strict>;
    bonus: z.ZodObject<{
        technologies: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            status: z.ZodEnum<{
                CONFIRMED: "CONFIRMED";
                UNCONFIRMED: "UNCONFIRMED";
                MISSING: "MISSING";
            }>;
            supporting_claim_ids: z.ZodArray<z.ZodString>;
            note: z.ZodString;
        }, z.core.$strict>>>;
        concepts: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            status: z.ZodEnum<{
                CONFIRMED: "CONFIRMED";
                UNCONFIRMED: "UNCONFIRMED";
                MISSING: "MISSING";
            }>;
            supporting_claim_ids: z.ZodArray<z.ZodString>;
            note: z.ZodString;
        }, z.core.$strict>>>;
        qualifications: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            status: z.ZodEnum<{
                CONFIRMED: "CONFIRMED";
                UNCONFIRMED: "UNCONFIRMED";
                MISSING: "MISSING";
            }>;
            supporting_claim_ids: z.ZodArray<z.ZodString>;
            note: z.ZodString;
        }, z.core.$strict>>>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type RequirementAnalysis = z.infer<typeof RequirementAnalysisSchema>;
export declare const PrioritizedProjectSchema: z.ZodObject<{
    project_id: z.ZodString;
    relevance: z.ZodObject<{
        score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
        rating: z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
            VERY_LOW: "VERY_LOW";
            VERY_HIGH: "VERY_HIGH";
            UNDETERMINABLE: "UNDETERMINABLE";
        }>;
        confidence: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
        }>>>>;
        supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>;
    quality: z.ZodObject<{
        score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
        rating: z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
            VERY_LOW: "VERY_LOW";
            VERY_HIGH: "VERY_HIGH";
            UNDETERMINABLE: "UNDETERMINABLE";
        }>;
        confidence: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
        }>>>>;
        supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>;
    score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    rating: z.ZodEnum<{
        HIGH: "HIGH";
        MEDIUM: "MEDIUM";
        LOW: "LOW";
        VERY_LOW: "VERY_LOW";
        VERY_HIGH: "VERY_HIGH";
        UNDETERMINABLE: "UNDETERMINABLE";
    }>;
    priority: z.ZodNumber;
    repository_url: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    summary: z.ZodString;
    supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strict>;
export type PrioritizedProject = z.infer<typeof PrioritizedProjectSchema>;
export declare const ProjectAnalysisSchema: z.ZodObject<{
    prioritized_projects: z.ZodDefault<z.ZodArray<z.ZodObject<{
        project_id: z.ZodString;
        relevance: z.ZodObject<{
            score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
            rating: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
                VERY_LOW: "VERY_LOW";
                VERY_HIGH: "VERY_HIGH";
                UNDETERMINABLE: "UNDETERMINABLE";
            }>;
            confidence: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
            }>>>>;
            supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>;
        quality: z.ZodObject<{
            score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
            rating: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
                VERY_LOW: "VERY_LOW";
                VERY_HIGH: "VERY_HIGH";
                UNDETERMINABLE: "UNDETERMINABLE";
            }>;
            confidence: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
            }>>>>;
            supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>;
        score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
        rating: z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
            VERY_LOW: "VERY_LOW";
            VERY_HIGH: "VERY_HIGH";
            UNDETERMINABLE: "UNDETERMINABLE";
        }>;
        priority: z.ZodNumber;
        repository_url: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
        summary: z.ZodString;
        supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>>>;
    ignored_projects: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strict>;
export type ProjectAnalysis = z.infer<typeof ProjectAnalysisSchema>;
export declare const ScoreDriverUpSchema: z.ZodObject<{
    claim_ids: z.ZodArray<z.ZodString>;
    reason: z.ZodString;
}, z.core.$strict>;
export type ScoreDriverUp = z.infer<typeof ScoreDriverUpSchema>;
export declare const ScoreDriverDownSchema: z.ZodObject<{
    claim_ids: z.ZodArray<z.ZodString>;
    reason: z.ZodString;
    impact: z.ZodEnum<{
        HIGH: "HIGH";
        MEDIUM: "MEDIUM";
        LOW: "LOW";
    }>;
}, z.core.$strict>;
export type ScoreDriverDown = z.infer<typeof ScoreDriverDownSchema>;
export declare const ScoreRationaleSchema: z.ZodObject<{
    drivers_up: z.ZodDefault<z.ZodArray<z.ZodObject<{
        claim_ids: z.ZodArray<z.ZodString>;
        reason: z.ZodString;
    }, z.core.$strict>>>;
    drivers_down: z.ZodDefault<z.ZodArray<z.ZodObject<{
        claim_ids: z.ZodArray<z.ZodString>;
        reason: z.ZodString;
        impact: z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
        }>;
    }, z.core.$strict>>>;
}, z.core.$strict>;
export type ScoreRationale = z.infer<typeof ScoreRationaleSchema>;
export declare const VerificationTargetSchema: z.ZodObject<{
    claim_id: z.ZodString;
    claim_type: z.ZodEnum<{
        RESPONSIBILITY: "RESPONSIBILITY";
        ACHIEVEMENT: "ACHIEVEMENT";
        IMPLEMENTATION: "IMPLEMENTATION";
        ARCHITECTURAL: "ARCHITECTURAL";
        MAJOR_FEATURE: "MAJOR_FEATURE";
    }>;
    related_project_id: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    importance: z.ZodEnum<{
        HIGH: "HIGH";
        MEDIUM: "MEDIUM";
        CRITICAL: "CRITICAL";
    }>;
    search_hints: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strict>;
export type VerificationTarget = z.infer<typeof VerificationTargetSchema>;
export declare const VerificationPlanSchema: z.ZodObject<{
    verification_targets: z.ZodDefault<z.ZodArray<z.ZodObject<{
        claim_id: z.ZodString;
        claim_type: z.ZodEnum<{
            RESPONSIBILITY: "RESPONSIBILITY";
            ACHIEVEMENT: "ACHIEVEMENT";
            IMPLEMENTATION: "IMPLEMENTATION";
            ARCHITECTURAL: "ARCHITECTURAL";
            MAJOR_FEATURE: "MAJOR_FEATURE";
        }>;
        related_project_id: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
        importance: z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            CRITICAL: "CRITICAL";
        }>;
        search_hints: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>>>;
}, z.core.$strict>;
export type VerificationPlan = z.infer<typeof VerificationPlanSchema>;
export declare const ReportConfidenceSchema: z.ZodObject<{
    extraction_quality: z.ZodEnum<{
        HIGH: "HIGH";
        MEDIUM: "MEDIUM";
        LOW: "LOW";
    }>;
    scoring_quality: z.ZodEnum<{
        HIGH: "HIGH";
        MEDIUM: "MEDIUM";
        LOW: "LOW";
    }>;
    overall: z.ZodEnum<{
        HIGH: "HIGH";
        MEDIUM: "MEDIUM";
        LOW: "LOW";
    }>;
}, z.core.$strict>;
export type ReportConfidence = z.infer<typeof ReportConfidenceSchema>;
export declare const OverallEvaluationSchema: z.ZodObject<{
    overall_role_fit: z.ZodEnum<{
        EXCEPTIONAL: "EXCEPTIONAL";
        STRONG: "STRONG";
        GOOD: "GOOD";
        MODERATE: "MODERATE";
        WEAK: "WEAK";
        POOR: "POOR";
    }>;
    overall_role_fit_score: z.ZodNumber;
    repository_priority: z.ZodEnum<{
        HIGH: "HIGH";
        MEDIUM: "MEDIUM";
        LOW: "LOW";
        CRITICAL: "CRITICAL";
    }>;
}, z.core.$strict>;
export type OverallEvaluation = z.infer<typeof OverallEvaluationSchema>;
export declare const MetadataLLMOutputSchema: z.ZodObject<{
    schema_version: z.ZodDefault<z.ZodString>;
}, z.core.$strict>;
export type MetadataLLMOutput = z.infer<typeof MetadataLLMOutputSchema>;
export declare const MetadataFullSchema: z.ZodObject<{
    schema_version: z.ZodDefault<z.ZodString>;
    job_id: z.ZodString;
    application_id: z.ZodString;
    extraction_id: z.ZodString;
    model: z.ZodString;
    timestamp: z.ZodString;
    evaluation_duration_ms: z.ZodNumber;
}, z.core.$strict>;
export type MetadataFull = z.infer<typeof MetadataFullSchema>;
export declare const ComputedScoresSchema: z.ZodObject<{
    requirement_coverage: z.ZodNumber;
    recruiter_weighted_priorities: z.ZodNumber;
    resume_match_score: z.ZodNumber;
}, z.core.$strict>;
export type ComputedScores = z.infer<typeof ComputedScoresSchema>;
export declare const ResumeEvaluationReportLLMOutputSchema: z.ZodObject<{
    metadata: z.ZodObject<{
        schema_version: z.ZodDefault<z.ZodString>;
    }, z.core.$strict>;
    requirement_analysis: z.ZodObject<{
        mandatory: z.ZodObject<{
            technologies: z.ZodDefault<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                status: z.ZodEnum<{
                    CONFIRMED: "CONFIRMED";
                    UNCONFIRMED: "UNCONFIRMED";
                    MISSING: "MISSING";
                }>;
                supporting_claim_ids: z.ZodArray<z.ZodString>;
                note: z.ZodString;
            }, z.core.$strict>>>;
            concepts: z.ZodDefault<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                status: z.ZodEnum<{
                    CONFIRMED: "CONFIRMED";
                    UNCONFIRMED: "UNCONFIRMED";
                    MISSING: "MISSING";
                }>;
                supporting_claim_ids: z.ZodArray<z.ZodString>;
                note: z.ZodString;
            }, z.core.$strict>>>;
            qualifications: z.ZodDefault<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                status: z.ZodEnum<{
                    CONFIRMED: "CONFIRMED";
                    UNCONFIRMED: "UNCONFIRMED";
                    MISSING: "MISSING";
                }>;
                supporting_claim_ids: z.ZodArray<z.ZodString>;
                note: z.ZodString;
            }, z.core.$strict>>>;
        }, z.core.$strict>;
        preferred: z.ZodObject<{
            technologies: z.ZodDefault<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                status: z.ZodEnum<{
                    CONFIRMED: "CONFIRMED";
                    UNCONFIRMED: "UNCONFIRMED";
                    MISSING: "MISSING";
                }>;
                supporting_claim_ids: z.ZodArray<z.ZodString>;
                note: z.ZodString;
            }, z.core.$strict>>>;
            concepts: z.ZodDefault<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                status: z.ZodEnum<{
                    CONFIRMED: "CONFIRMED";
                    UNCONFIRMED: "UNCONFIRMED";
                    MISSING: "MISSING";
                }>;
                supporting_claim_ids: z.ZodArray<z.ZodString>;
                note: z.ZodString;
            }, z.core.$strict>>>;
            qualifications: z.ZodDefault<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                status: z.ZodEnum<{
                    CONFIRMED: "CONFIRMED";
                    UNCONFIRMED: "UNCONFIRMED";
                    MISSING: "MISSING";
                }>;
                supporting_claim_ids: z.ZodArray<z.ZodString>;
                note: z.ZodString;
            }, z.core.$strict>>>;
        }, z.core.$strict>;
        bonus: z.ZodObject<{
            technologies: z.ZodDefault<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                status: z.ZodEnum<{
                    CONFIRMED: "CONFIRMED";
                    UNCONFIRMED: "UNCONFIRMED";
                    MISSING: "MISSING";
                }>;
                supporting_claim_ids: z.ZodArray<z.ZodString>;
                note: z.ZodString;
            }, z.core.$strict>>>;
            concepts: z.ZodDefault<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                status: z.ZodEnum<{
                    CONFIRMED: "CONFIRMED";
                    UNCONFIRMED: "UNCONFIRMED";
                    MISSING: "MISSING";
                }>;
                supporting_claim_ids: z.ZodArray<z.ZodString>;
                note: z.ZodString;
            }, z.core.$strict>>>;
            qualifications: z.ZodDefault<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                status: z.ZodEnum<{
                    CONFIRMED: "CONFIRMED";
                    UNCONFIRMED: "UNCONFIRMED";
                    MISSING: "MISSING";
                }>;
                supporting_claim_ids: z.ZodArray<z.ZodString>;
                note: z.ZodString;
            }, z.core.$strict>>>;
        }, z.core.$strict>;
    }, z.core.$strict>;
    project_analysis: z.ZodObject<{
        prioritized_projects: z.ZodDefault<z.ZodArray<z.ZodObject<{
            project_id: z.ZodString;
            relevance: z.ZodObject<{
                score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
                rating: z.ZodEnum<{
                    HIGH: "HIGH";
                    MEDIUM: "MEDIUM";
                    LOW: "LOW";
                    VERY_LOW: "VERY_LOW";
                    VERY_HIGH: "VERY_HIGH";
                    UNDETERMINABLE: "UNDETERMINABLE";
                }>;
                confidence: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                    HIGH: "HIGH";
                    MEDIUM: "MEDIUM";
                    LOW: "LOW";
                }>>>>;
                supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>;
            quality: z.ZodObject<{
                score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
                rating: z.ZodEnum<{
                    HIGH: "HIGH";
                    MEDIUM: "MEDIUM";
                    LOW: "LOW";
                    VERY_LOW: "VERY_LOW";
                    VERY_HIGH: "VERY_HIGH";
                    UNDETERMINABLE: "UNDETERMINABLE";
                }>;
                confidence: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                    HIGH: "HIGH";
                    MEDIUM: "MEDIUM";
                    LOW: "LOW";
                }>>>>;
                supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>;
            score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
            rating: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
                VERY_LOW: "VERY_LOW";
                VERY_HIGH: "VERY_HIGH";
                UNDETERMINABLE: "UNDETERMINABLE";
            }>;
            priority: z.ZodNumber;
            repository_url: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
            summary: z.ZodString;
            supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>>>;
        ignored_projects: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>;
    bucket_scores: z.ZodObject<{
        primary_evidence: z.ZodObject<{
            source_type: z.ZodEnum<{
                WORK: "WORK";
                PROJECT: "PROJECT";
            }>;
            relevance: z.ZodObject<{
                score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
                rating: z.ZodEnum<{
                    HIGH: "HIGH";
                    MEDIUM: "MEDIUM";
                    LOW: "LOW";
                    VERY_LOW: "VERY_LOW";
                    VERY_HIGH: "VERY_HIGH";
                    UNDETERMINABLE: "UNDETERMINABLE";
                }>;
                confidence: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                    HIGH: "HIGH";
                    MEDIUM: "MEDIUM";
                    LOW: "LOW";
                }>>>>;
                supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>;
            quality: z.ZodObject<{
                score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
                rating: z.ZodEnum<{
                    HIGH: "HIGH";
                    MEDIUM: "MEDIUM";
                    LOW: "LOW";
                    VERY_LOW: "VERY_LOW";
                    VERY_HIGH: "VERY_HIGH";
                    UNDETERMINABLE: "UNDETERMINABLE";
                }>;
                confidence: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                    HIGH: "HIGH";
                    MEDIUM: "MEDIUM";
                    LOW: "LOW";
                }>>>>;
                supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>;
            score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
            rating: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
                VERY_LOW: "VERY_LOW";
                VERY_HIGH: "VERY_HIGH";
                UNDETERMINABLE: "UNDETERMINABLE";
            }>;
            confidence: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
            }>;
            summary: z.ZodString;
            supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>;
        secondary_evidence: z.ZodObject<{
            source_type: z.ZodEnum<{
                WORK: "WORK";
                PROJECT: "PROJECT";
            }>;
            relevance: z.ZodObject<{
                score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
                rating: z.ZodEnum<{
                    HIGH: "HIGH";
                    MEDIUM: "MEDIUM";
                    LOW: "LOW";
                    VERY_LOW: "VERY_LOW";
                    VERY_HIGH: "VERY_HIGH";
                    UNDETERMINABLE: "UNDETERMINABLE";
                }>;
                confidence: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                    HIGH: "HIGH";
                    MEDIUM: "MEDIUM";
                    LOW: "LOW";
                }>>>>;
                supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>;
            quality: z.ZodObject<{
                score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
                rating: z.ZodEnum<{
                    HIGH: "HIGH";
                    MEDIUM: "MEDIUM";
                    LOW: "LOW";
                    VERY_LOW: "VERY_LOW";
                    VERY_HIGH: "VERY_HIGH";
                    UNDETERMINABLE: "UNDETERMINABLE";
                }>;
                confidence: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                    HIGH: "HIGH";
                    MEDIUM: "MEDIUM";
                    LOW: "LOW";
                }>>>>;
                supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>;
            score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
            rating: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
                VERY_LOW: "VERY_LOW";
                VERY_HIGH: "VERY_HIGH";
                UNDETERMINABLE: "UNDETERMINABLE";
            }>;
            confidence: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
            }>;
            summary: z.ZodString;
            supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>;
        concept_alignment: z.ZodObject<{
            rating: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
                VERY_LOW: "VERY_LOW";
                VERY_HIGH: "VERY_HIGH";
                UNDETERMINABLE: "UNDETERMINABLE";
            }>;
            score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
            confidence: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
            }>;
            summary: z.ZodString;
            supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>;
        technology_alignment: z.ZodIntersection<z.ZodObject<{
            rating: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
                VERY_LOW: "VERY_LOW";
                VERY_HIGH: "VERY_HIGH";
                UNDETERMINABLE: "UNDETERMINABLE";
            }>;
            score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
            confidence: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
            }>;
            summary: z.ZodString;
            supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>, z.ZodObject<{
            mandatory_technologies_present: z.ZodBoolean;
        }, z.core.$strict>>;
        qualification_alignment: z.ZodIntersection<z.ZodObject<{
            rating: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
                VERY_LOW: "VERY_LOW";
                VERY_HIGH: "VERY_HIGH";
                UNDETERMINABLE: "UNDETERMINABLE";
            }>;
            score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
            confidence: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
            }>;
            summary: z.ZodString;
            supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>, z.ZodObject<{
            mandatory_qualifications_present: z.ZodBoolean;
        }, z.core.$strict>>;
        supporting_signals: z.ZodIntersection<z.ZodObject<{
            rating: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
                VERY_LOW: "VERY_LOW";
                VERY_HIGH: "VERY_HIGH";
                UNDETERMINABLE: "UNDETERMINABLE";
            }>;
            score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
            confidence: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
            }>;
            summary: z.ZodString;
            supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>, z.ZodObject<{
            signals: z.ZodDefault<z.ZodArray<z.ZodObject<{
                code: z.ZodString;
                priority_type: z.ZodEnum<{
                    MANDATORY: "MANDATORY";
                    PREFERRED: "PREFERRED";
                    BONUS: "BONUS";
                }>;
                rating: z.ZodEnum<{
                    HIGH: "HIGH";
                    MEDIUM: "MEDIUM";
                    LOW: "LOW";
                    VERY_LOW: "VERY_LOW";
                    VERY_HIGH: "VERY_HIGH";
                    UNDETERMINABLE: "UNDETERMINABLE";
                }>;
                score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
                note: z.ZodString;
                supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    score_rationale: z.ZodObject<{
        drivers_up: z.ZodDefault<z.ZodArray<z.ZodObject<{
            claim_ids: z.ZodArray<z.ZodString>;
            reason: z.ZodString;
        }, z.core.$strict>>>;
        drivers_down: z.ZodDefault<z.ZodArray<z.ZodObject<{
            claim_ids: z.ZodArray<z.ZodString>;
            reason: z.ZodString;
            impact: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
            }>;
        }, z.core.$strict>>>;
    }, z.core.$strict>;
    decision_critical_claims: z.ZodDefault<z.ZodArray<z.ZodString>>;
    verification_plan: z.ZodObject<{
        verification_targets: z.ZodDefault<z.ZodArray<z.ZodObject<{
            claim_id: z.ZodString;
            claim_type: z.ZodEnum<{
                RESPONSIBILITY: "RESPONSIBILITY";
                ACHIEVEMENT: "ACHIEVEMENT";
                IMPLEMENTATION: "IMPLEMENTATION";
                ARCHITECTURAL: "ARCHITECTURAL";
                MAJOR_FEATURE: "MAJOR_FEATURE";
            }>;
            related_project_id: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
            importance: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                CRITICAL: "CRITICAL";
            }>;
            search_hints: z.ZodDefault<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>>>;
    }, z.core.$strict>;
    confidence: z.ZodObject<{
        extraction_quality: z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
        }>;
        scoring_quality: z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
        }>;
        overall: z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
        }>;
    }, z.core.$strict>;
    overall: z.ZodObject<{
        overall_role_fit: z.ZodEnum<{
            EXCEPTIONAL: "EXCEPTIONAL";
            STRONG: "STRONG";
            GOOD: "GOOD";
            MODERATE: "MODERATE";
            WEAK: "WEAK";
            POOR: "POOR";
        }>;
        overall_role_fit_score: z.ZodNumber;
        repository_priority: z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
            CRITICAL: "CRITICAL";
        }>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type ResumeEvaluationReportLLMOutput = z.infer<typeof ResumeEvaluationReportLLMOutputSchema>;
export declare const ResumeEvaluationReportSchema: z.ZodObject<{
    metadata: z.ZodObject<{
        schema_version: z.ZodDefault<z.ZodString>;
        job_id: z.ZodString;
        application_id: z.ZodString;
        extraction_id: z.ZodString;
        model: z.ZodString;
        timestamp: z.ZodString;
        evaluation_duration_ms: z.ZodNumber;
    }, z.core.$strict>;
    requirement_analysis: z.ZodObject<{
        mandatory: z.ZodObject<{
            technologies: z.ZodDefault<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                status: z.ZodEnum<{
                    CONFIRMED: "CONFIRMED";
                    UNCONFIRMED: "UNCONFIRMED";
                    MISSING: "MISSING";
                }>;
                supporting_claim_ids: z.ZodArray<z.ZodString>;
                note: z.ZodString;
            }, z.core.$strict>>>;
            concepts: z.ZodDefault<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                status: z.ZodEnum<{
                    CONFIRMED: "CONFIRMED";
                    UNCONFIRMED: "UNCONFIRMED";
                    MISSING: "MISSING";
                }>;
                supporting_claim_ids: z.ZodArray<z.ZodString>;
                note: z.ZodString;
            }, z.core.$strict>>>;
            qualifications: z.ZodDefault<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                status: z.ZodEnum<{
                    CONFIRMED: "CONFIRMED";
                    UNCONFIRMED: "UNCONFIRMED";
                    MISSING: "MISSING";
                }>;
                supporting_claim_ids: z.ZodArray<z.ZodString>;
                note: z.ZodString;
            }, z.core.$strict>>>;
        }, z.core.$strict>;
        preferred: z.ZodObject<{
            technologies: z.ZodDefault<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                status: z.ZodEnum<{
                    CONFIRMED: "CONFIRMED";
                    UNCONFIRMED: "UNCONFIRMED";
                    MISSING: "MISSING";
                }>;
                supporting_claim_ids: z.ZodArray<z.ZodString>;
                note: z.ZodString;
            }, z.core.$strict>>>;
            concepts: z.ZodDefault<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                status: z.ZodEnum<{
                    CONFIRMED: "CONFIRMED";
                    UNCONFIRMED: "UNCONFIRMED";
                    MISSING: "MISSING";
                }>;
                supporting_claim_ids: z.ZodArray<z.ZodString>;
                note: z.ZodString;
            }, z.core.$strict>>>;
            qualifications: z.ZodDefault<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                status: z.ZodEnum<{
                    CONFIRMED: "CONFIRMED";
                    UNCONFIRMED: "UNCONFIRMED";
                    MISSING: "MISSING";
                }>;
                supporting_claim_ids: z.ZodArray<z.ZodString>;
                note: z.ZodString;
            }, z.core.$strict>>>;
        }, z.core.$strict>;
        bonus: z.ZodObject<{
            technologies: z.ZodDefault<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                status: z.ZodEnum<{
                    CONFIRMED: "CONFIRMED";
                    UNCONFIRMED: "UNCONFIRMED";
                    MISSING: "MISSING";
                }>;
                supporting_claim_ids: z.ZodArray<z.ZodString>;
                note: z.ZodString;
            }, z.core.$strict>>>;
            concepts: z.ZodDefault<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                status: z.ZodEnum<{
                    CONFIRMED: "CONFIRMED";
                    UNCONFIRMED: "UNCONFIRMED";
                    MISSING: "MISSING";
                }>;
                supporting_claim_ids: z.ZodArray<z.ZodString>;
                note: z.ZodString;
            }, z.core.$strict>>>;
            qualifications: z.ZodDefault<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                status: z.ZodEnum<{
                    CONFIRMED: "CONFIRMED";
                    UNCONFIRMED: "UNCONFIRMED";
                    MISSING: "MISSING";
                }>;
                supporting_claim_ids: z.ZodArray<z.ZodString>;
                note: z.ZodString;
            }, z.core.$strict>>>;
        }, z.core.$strict>;
    }, z.core.$strict>;
    project_analysis: z.ZodObject<{
        prioritized_projects: z.ZodDefault<z.ZodArray<z.ZodObject<{
            project_id: z.ZodString;
            relevance: z.ZodObject<{
                score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
                rating: z.ZodEnum<{
                    HIGH: "HIGH";
                    MEDIUM: "MEDIUM";
                    LOW: "LOW";
                    VERY_LOW: "VERY_LOW";
                    VERY_HIGH: "VERY_HIGH";
                    UNDETERMINABLE: "UNDETERMINABLE";
                }>;
                confidence: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                    HIGH: "HIGH";
                    MEDIUM: "MEDIUM";
                    LOW: "LOW";
                }>>>>;
                supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>;
            quality: z.ZodObject<{
                score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
                rating: z.ZodEnum<{
                    HIGH: "HIGH";
                    MEDIUM: "MEDIUM";
                    LOW: "LOW";
                    VERY_LOW: "VERY_LOW";
                    VERY_HIGH: "VERY_HIGH";
                    UNDETERMINABLE: "UNDETERMINABLE";
                }>;
                confidence: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                    HIGH: "HIGH";
                    MEDIUM: "MEDIUM";
                    LOW: "LOW";
                }>>>>;
                supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>;
            score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
            rating: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
                VERY_LOW: "VERY_LOW";
                VERY_HIGH: "VERY_HIGH";
                UNDETERMINABLE: "UNDETERMINABLE";
            }>;
            priority: z.ZodNumber;
            repository_url: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
            summary: z.ZodString;
            supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>>>;
        ignored_projects: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>;
    bucket_scores: z.ZodObject<{
        primary_evidence: z.ZodObject<{
            source_type: z.ZodEnum<{
                WORK: "WORK";
                PROJECT: "PROJECT";
            }>;
            relevance: z.ZodObject<{
                score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
                rating: z.ZodEnum<{
                    HIGH: "HIGH";
                    MEDIUM: "MEDIUM";
                    LOW: "LOW";
                    VERY_LOW: "VERY_LOW";
                    VERY_HIGH: "VERY_HIGH";
                    UNDETERMINABLE: "UNDETERMINABLE";
                }>;
                confidence: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                    HIGH: "HIGH";
                    MEDIUM: "MEDIUM";
                    LOW: "LOW";
                }>>>>;
                supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>;
            quality: z.ZodObject<{
                score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
                rating: z.ZodEnum<{
                    HIGH: "HIGH";
                    MEDIUM: "MEDIUM";
                    LOW: "LOW";
                    VERY_LOW: "VERY_LOW";
                    VERY_HIGH: "VERY_HIGH";
                    UNDETERMINABLE: "UNDETERMINABLE";
                }>;
                confidence: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                    HIGH: "HIGH";
                    MEDIUM: "MEDIUM";
                    LOW: "LOW";
                }>>>>;
                supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>;
            score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
            rating: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
                VERY_LOW: "VERY_LOW";
                VERY_HIGH: "VERY_HIGH";
                UNDETERMINABLE: "UNDETERMINABLE";
            }>;
            confidence: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
            }>;
            summary: z.ZodString;
            supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>;
        secondary_evidence: z.ZodObject<{
            source_type: z.ZodEnum<{
                WORK: "WORK";
                PROJECT: "PROJECT";
            }>;
            relevance: z.ZodObject<{
                score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
                rating: z.ZodEnum<{
                    HIGH: "HIGH";
                    MEDIUM: "MEDIUM";
                    LOW: "LOW";
                    VERY_LOW: "VERY_LOW";
                    VERY_HIGH: "VERY_HIGH";
                    UNDETERMINABLE: "UNDETERMINABLE";
                }>;
                confidence: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                    HIGH: "HIGH";
                    MEDIUM: "MEDIUM";
                    LOW: "LOW";
                }>>>>;
                supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>;
            quality: z.ZodObject<{
                score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
                rating: z.ZodEnum<{
                    HIGH: "HIGH";
                    MEDIUM: "MEDIUM";
                    LOW: "LOW";
                    VERY_LOW: "VERY_LOW";
                    VERY_HIGH: "VERY_HIGH";
                    UNDETERMINABLE: "UNDETERMINABLE";
                }>;
                confidence: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                    HIGH: "HIGH";
                    MEDIUM: "MEDIUM";
                    LOW: "LOW";
                }>>>>;
                supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>;
            score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
            rating: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
                VERY_LOW: "VERY_LOW";
                VERY_HIGH: "VERY_HIGH";
                UNDETERMINABLE: "UNDETERMINABLE";
            }>;
            confidence: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
            }>;
            summary: z.ZodString;
            supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>;
        concept_alignment: z.ZodObject<{
            rating: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
                VERY_LOW: "VERY_LOW";
                VERY_HIGH: "VERY_HIGH";
                UNDETERMINABLE: "UNDETERMINABLE";
            }>;
            score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
            confidence: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
            }>;
            summary: z.ZodString;
            supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>;
        technology_alignment: z.ZodIntersection<z.ZodObject<{
            rating: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
                VERY_LOW: "VERY_LOW";
                VERY_HIGH: "VERY_HIGH";
                UNDETERMINABLE: "UNDETERMINABLE";
            }>;
            score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
            confidence: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
            }>;
            summary: z.ZodString;
            supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>, z.ZodObject<{
            mandatory_technologies_present: z.ZodBoolean;
        }, z.core.$strict>>;
        qualification_alignment: z.ZodIntersection<z.ZodObject<{
            rating: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
                VERY_LOW: "VERY_LOW";
                VERY_HIGH: "VERY_HIGH";
                UNDETERMINABLE: "UNDETERMINABLE";
            }>;
            score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
            confidence: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
            }>;
            summary: z.ZodString;
            supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>, z.ZodObject<{
            mandatory_qualifications_present: z.ZodBoolean;
        }, z.core.$strict>>;
        supporting_signals: z.ZodIntersection<z.ZodObject<{
            rating: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
                VERY_LOW: "VERY_LOW";
                VERY_HIGH: "VERY_HIGH";
                UNDETERMINABLE: "UNDETERMINABLE";
            }>;
            score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
            confidence: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
            }>;
            summary: z.ZodString;
            supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>, z.ZodObject<{
            signals: z.ZodDefault<z.ZodArray<z.ZodObject<{
                code: z.ZodString;
                priority_type: z.ZodEnum<{
                    MANDATORY: "MANDATORY";
                    PREFERRED: "PREFERRED";
                    BONUS: "BONUS";
                }>;
                rating: z.ZodEnum<{
                    HIGH: "HIGH";
                    MEDIUM: "MEDIUM";
                    LOW: "LOW";
                    VERY_LOW: "VERY_LOW";
                    VERY_HIGH: "VERY_HIGH";
                    UNDETERMINABLE: "UNDETERMINABLE";
                }>;
                score: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
                note: z.ZodString;
                supporting_claim_ids: z.ZodDefault<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    computed_scores: z.ZodObject<{
        requirement_coverage: z.ZodNumber;
        recruiter_weighted_priorities: z.ZodNumber;
        resume_match_score: z.ZodNumber;
    }, z.core.$strict>;
    score_rationale: z.ZodObject<{
        drivers_up: z.ZodDefault<z.ZodArray<z.ZodObject<{
            claim_ids: z.ZodArray<z.ZodString>;
            reason: z.ZodString;
        }, z.core.$strict>>>;
        drivers_down: z.ZodDefault<z.ZodArray<z.ZodObject<{
            claim_ids: z.ZodArray<z.ZodString>;
            reason: z.ZodString;
            impact: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                LOW: "LOW";
            }>;
        }, z.core.$strict>>>;
    }, z.core.$strict>;
    decision_critical_claims: z.ZodDefault<z.ZodArray<z.ZodString>>;
    verification_plan: z.ZodObject<{
        verification_targets: z.ZodDefault<z.ZodArray<z.ZodObject<{
            claim_id: z.ZodString;
            claim_type: z.ZodEnum<{
                RESPONSIBILITY: "RESPONSIBILITY";
                ACHIEVEMENT: "ACHIEVEMENT";
                IMPLEMENTATION: "IMPLEMENTATION";
                ARCHITECTURAL: "ARCHITECTURAL";
                MAJOR_FEATURE: "MAJOR_FEATURE";
            }>;
            related_project_id: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
            importance: z.ZodEnum<{
                HIGH: "HIGH";
                MEDIUM: "MEDIUM";
                CRITICAL: "CRITICAL";
            }>;
            search_hints: z.ZodDefault<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>>>;
    }, z.core.$strict>;
    confidence: z.ZodObject<{
        extraction_quality: z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
        }>;
        scoring_quality: z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
        }>;
        overall: z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
        }>;
    }, z.core.$strict>;
    overall: z.ZodObject<{
        overall_role_fit: z.ZodEnum<{
            EXCEPTIONAL: "EXCEPTIONAL";
            STRONG: "STRONG";
            GOOD: "GOOD";
            MODERATE: "MODERATE";
            WEAK: "WEAK";
            POOR: "POOR";
        }>;
        overall_role_fit_score: z.ZodNumber;
        repository_priority: z.ZodEnum<{
            HIGH: "HIGH";
            MEDIUM: "MEDIUM";
            LOW: "LOW";
            CRITICAL: "CRITICAL";
        }>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type ResumeEvaluationReport = z.infer<typeof ResumeEvaluationReportSchema>;
export declare function parseResumeEvaluationReport(json: unknown): ResumeEvaluationReport;
export declare function safeParseResumeEvaluationReport(json: unknown): z.ZodSafeParseResult<{
    metadata: {
        schema_version: string;
        job_id: string;
        application_id: string;
        extraction_id: string;
        model: string;
        timestamp: string;
        evaluation_duration_ms: number;
    };
    requirement_analysis: {
        mandatory: {
            technologies: {
                name: string;
                status: "CONFIRMED" | "UNCONFIRMED" | "MISSING";
                supporting_claim_ids: string[];
                note: string;
            }[];
            concepts: {
                name: string;
                status: "CONFIRMED" | "UNCONFIRMED" | "MISSING";
                supporting_claim_ids: string[];
                note: string;
            }[];
            qualifications: {
                name: string;
                status: "CONFIRMED" | "UNCONFIRMED" | "MISSING";
                supporting_claim_ids: string[];
                note: string;
            }[];
        };
        preferred: {
            technologies: {
                name: string;
                status: "CONFIRMED" | "UNCONFIRMED" | "MISSING";
                supporting_claim_ids: string[];
                note: string;
            }[];
            concepts: {
                name: string;
                status: "CONFIRMED" | "UNCONFIRMED" | "MISSING";
                supporting_claim_ids: string[];
                note: string;
            }[];
            qualifications: {
                name: string;
                status: "CONFIRMED" | "UNCONFIRMED" | "MISSING";
                supporting_claim_ids: string[];
                note: string;
            }[];
        };
        bonus: {
            technologies: {
                name: string;
                status: "CONFIRMED" | "UNCONFIRMED" | "MISSING";
                supporting_claim_ids: string[];
                note: string;
            }[];
            concepts: {
                name: string;
                status: "CONFIRMED" | "UNCONFIRMED" | "MISSING";
                supporting_claim_ids: string[];
                note: string;
            }[];
            qualifications: {
                name: string;
                status: "CONFIRMED" | "UNCONFIRMED" | "MISSING";
                supporting_claim_ids: string[];
                note: string;
            }[];
        };
    };
    project_analysis: {
        prioritized_projects: {
            project_id: string;
            relevance: {
                score: number | null;
                rating: "HIGH" | "MEDIUM" | "LOW" | "VERY_LOW" | "VERY_HIGH" | "UNDETERMINABLE";
                confidence: "HIGH" | "MEDIUM" | "LOW" | null;
                supporting_claim_ids: string[];
            };
            quality: {
                score: number | null;
                rating: "HIGH" | "MEDIUM" | "LOW" | "VERY_LOW" | "VERY_HIGH" | "UNDETERMINABLE";
                confidence: "HIGH" | "MEDIUM" | "LOW" | null;
                supporting_claim_ids: string[];
            };
            score: number | null;
            rating: "HIGH" | "MEDIUM" | "LOW" | "VERY_LOW" | "VERY_HIGH" | "UNDETERMINABLE";
            priority: number;
            repository_url: string | null;
            summary: string;
            supporting_claim_ids: string[];
        }[];
        ignored_projects: string[];
    };
    bucket_scores: {
        primary_evidence: {
            source_type: "WORK" | "PROJECT";
            relevance: {
                score: number | null;
                rating: "HIGH" | "MEDIUM" | "LOW" | "VERY_LOW" | "VERY_HIGH" | "UNDETERMINABLE";
                confidence: "HIGH" | "MEDIUM" | "LOW" | null;
                supporting_claim_ids: string[];
            };
            quality: {
                score: number | null;
                rating: "HIGH" | "MEDIUM" | "LOW" | "VERY_LOW" | "VERY_HIGH" | "UNDETERMINABLE";
                confidence: "HIGH" | "MEDIUM" | "LOW" | null;
                supporting_claim_ids: string[];
            };
            score: number | null;
            rating: "HIGH" | "MEDIUM" | "LOW" | "VERY_LOW" | "VERY_HIGH" | "UNDETERMINABLE";
            confidence: "HIGH" | "MEDIUM" | "LOW";
            summary: string;
            supporting_claim_ids: string[];
        };
        secondary_evidence: {
            source_type: "WORK" | "PROJECT";
            relevance: {
                score: number | null;
                rating: "HIGH" | "MEDIUM" | "LOW" | "VERY_LOW" | "VERY_HIGH" | "UNDETERMINABLE";
                confidence: "HIGH" | "MEDIUM" | "LOW" | null;
                supporting_claim_ids: string[];
            };
            quality: {
                score: number | null;
                rating: "HIGH" | "MEDIUM" | "LOW" | "VERY_LOW" | "VERY_HIGH" | "UNDETERMINABLE";
                confidence: "HIGH" | "MEDIUM" | "LOW" | null;
                supporting_claim_ids: string[];
            };
            score: number | null;
            rating: "HIGH" | "MEDIUM" | "LOW" | "VERY_LOW" | "VERY_HIGH" | "UNDETERMINABLE";
            confidence: "HIGH" | "MEDIUM" | "LOW";
            summary: string;
            supporting_claim_ids: string[];
        };
        concept_alignment: {
            rating: "HIGH" | "MEDIUM" | "LOW" | "VERY_LOW" | "VERY_HIGH" | "UNDETERMINABLE";
            score: number | null;
            confidence: "HIGH" | "MEDIUM" | "LOW";
            summary: string;
            supporting_claim_ids: string[];
        };
        technology_alignment: {
            rating: "HIGH" | "MEDIUM" | "LOW" | "VERY_LOW" | "VERY_HIGH" | "UNDETERMINABLE";
            score: number | null;
            confidence: "HIGH" | "MEDIUM" | "LOW";
            summary: string;
            supporting_claim_ids: string[];
        } & {
            mandatory_technologies_present: boolean;
        };
        qualification_alignment: {
            rating: "HIGH" | "MEDIUM" | "LOW" | "VERY_LOW" | "VERY_HIGH" | "UNDETERMINABLE";
            score: number | null;
            confidence: "HIGH" | "MEDIUM" | "LOW";
            summary: string;
            supporting_claim_ids: string[];
        } & {
            mandatory_qualifications_present: boolean;
        };
        supporting_signals: {
            rating: "HIGH" | "MEDIUM" | "LOW" | "VERY_LOW" | "VERY_HIGH" | "UNDETERMINABLE";
            score: number | null;
            confidence: "HIGH" | "MEDIUM" | "LOW";
            summary: string;
            supporting_claim_ids: string[];
        } & {
            signals: {
                code: string;
                priority_type: "MANDATORY" | "PREFERRED" | "BONUS";
                rating: "HIGH" | "MEDIUM" | "LOW" | "VERY_LOW" | "VERY_HIGH" | "UNDETERMINABLE";
                score: number | null;
                note: string;
                supporting_claim_ids: string[];
            }[];
        };
    };
    computed_scores: {
        requirement_coverage: number;
        recruiter_weighted_priorities: number;
        resume_match_score: number;
    };
    score_rationale: {
        drivers_up: {
            claim_ids: string[];
            reason: string;
        }[];
        drivers_down: {
            claim_ids: string[];
            reason: string;
            impact: "HIGH" | "MEDIUM" | "LOW";
        }[];
    };
    decision_critical_claims: string[];
    verification_plan: {
        verification_targets: {
            claim_id: string;
            claim_type: "RESPONSIBILITY" | "ACHIEVEMENT" | "IMPLEMENTATION" | "ARCHITECTURAL" | "MAJOR_FEATURE";
            related_project_id: string | null;
            importance: "HIGH" | "MEDIUM" | "CRITICAL";
            search_hints: string[];
        }[];
    };
    confidence: {
        extraction_quality: "HIGH" | "MEDIUM" | "LOW";
        scoring_quality: "HIGH" | "MEDIUM" | "LOW";
        overall: "HIGH" | "MEDIUM" | "LOW";
    };
    overall: {
        overall_role_fit: "EXCEPTIONAL" | "STRONG" | "GOOD" | "MODERATE" | "WEAK" | "POOR";
        overall_role_fit_score: number;
        repository_priority: "HIGH" | "MEDIUM" | "LOW" | "CRITICAL";
    };
}>;
//# sourceMappingURL=evaluationReport.d.ts.map