import { z } from "zod";
export declare const ResumeAnalysisResponseSchema: z.ZodObject<{
    candidate: z.ZodObject<{
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
    evaluation: z.ZodObject<{
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
    raw_llm_response: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type ResumeAnalysisResponse = z.infer<typeof ResumeAnalysisResponseSchema>;
//# sourceMappingURL=resumeEvaluation.d.ts.map