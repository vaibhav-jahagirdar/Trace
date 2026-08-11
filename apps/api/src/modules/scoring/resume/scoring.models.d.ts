export type PipelineStatus = 'SCORED' | 'DISQUALIFIED' | 'QUARANTINED';
export interface EvaluationInput {
    bucket_scores?: {
        primary_evidence?: {
            score?: number | null;
        };
        secondary_evidence?: {
            score?: number | null;
        };
        concept_alignment?: {
            score?: number | null;
        };
        technology_alignment?: {
            score?: number | null;
        };
        qualification_alignment?: {
            score?: number | null;
        };
        supporting_signals?: {
            score?: number | null;
            signals?: Array<{
                code: string;
                score?: number | null;
                priority_type?: string;
            }>;
        };
    };
    requirement_analysis?: {
        mandatory?: {
            technologies?: Array<{
                name: string;
                status: string;
                note?: string;
            }>;
            concepts?: Array<{
                name: string;
                status: string;
                note?: string;
            }>;
            qualifications?: Array<{
                name: string;
                status: string;
                note?: string;
            }>;
        };
        preferred?: {
            technologies?: Array<{
                name: string;
                status: string;
                note?: string;
            }>;
            concepts?: Array<{
                name: string;
                status: string;
                note?: string;
            }>;
            qualifications?: Array<{
                name: string;
                status: string;
                note?: string;
            }>;
        };
        bonus?: {
            technologies?: Array<{
                name: string;
                status: string;
                note?: string;
            }>;
            concepts?: Array<{
                name: string;
                status: string;
                note?: string;
            }>;
            qualifications?: Array<{
                name: string;
                status: string;
                note?: string;
            }>;
        };
    };
    overall?: {
        overall_role_fit?: string;
        repository_priority?: string;
    };
}
export interface JobContextInput {
    strictTechnologyMode?: boolean;
    qualifications?: {
        experienceYearsMin?: number | null;
        experienceYearsMax?: number | null;
        minimumEducationLevel?: string | null;
    };
    evaluationPriorities?: Array<{
        code: string;
        weight: number;
    }>;
    successSignals?: Array<{
        code: string;
        weight: number;
    }>;
    evidencePriorities?: Array<{
        code: string;
        weight: number;
    }>;
}
export interface CandidateInput {
    candidate_profile?: {
        claimed_total_experience_years?: number | null;
    };
    education?: Array<{
        degree?: string | null;
    }>;
}
export interface BucketContribution {
    bucket: string;
    raw_score: number | null;
    weight_applied: number;
    weighted_contribution: number;
    excluded_reason?: string;
}
export interface GateResult {
    name: string;
    applied: boolean;
    ceiling: number | null;
    reason: string;
}
export interface ScoreResult {
    candidate_ref: string;
    status: PipelineStatus;
    resume_match_score: number | null;
    layer1_continuous_score: number | null;
    bucket_contributions: BucketContribution[];
    gates: GateResult[];
    stage2_priority_hints: Record<string, number>;
    audit_notes: string[];
    overall_role_fit?: string | null;
    repository_priority?: string | null;
}
export interface RankedCandidate {
    candidate_ref: string;
    resume_match_score: number;
    rank: number;
    percentile: number;
    admitted_to_stage2: boolean;
}
export interface RankingReport {
    admitted: RankedCandidate[];
    rejected: RankedCandidate[];
    disqualified: ScoreResult[];
    quarantined: ScoreResult[];
}
export declare function getBucketScore(evaluation: EvaluationInput | null | undefined, bucketName: string): number | null;
export declare function getRawSignals(evaluation: EvaluationInput | null | undefined): Array<{
    code: string;
    score?: number | null;
    priority_type?: string;
}>;
export declare function flattenRequirementItems(evaluation: EvaluationInput | null | undefined): Array<{
    tier: string;
    kind: string;
    name: string;
    status: string;
    note: string;
}>;
export declare function looksLikeSubstitution(note: string | null | undefined): boolean;
export declare function getClaimedYears(candidate: CandidateInput | null | undefined): number | null;
export declare function getHighestEducationLevel(candidate: CandidateInput | null | undefined): number;
//# sourceMappingURL=scoring.models.d.ts.map