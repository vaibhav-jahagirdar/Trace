export type PipelineStatus = 'SCORED' | 'DISQUALIFIED' | 'QUARANTINED';

export interface EvaluationInput {
  bucket_scores?: {
    primary_evidence?: { score?: number | null };
    secondary_evidence?: { score?: number | null };
    concept_alignment?: { score?: number | null };
    technology_alignment?: { score?: number | null };
    qualification_alignment?: { score?: number | null };
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
      technologies?: Array<{ name: string; status: string; note?: string }>;
      concepts?: Array<{ name: string; status: string; note?: string }>;
      qualifications?: Array<{ name: string; status: string; note?: string }>;
    };
    preferred?: {
      technologies?: Array<{ name: string; status: string; note?: string }>;
      concepts?: Array<{ name: string; status: string; note?: string }>;
      qualifications?: Array<{ name: string; status: string; note?: string }>;
    };
    bonus?: {
      technologies?: Array<{ name: string; status: string; note?: string }>;
      concepts?: Array<{ name: string; status: string; note?: string }>;
      qualifications?: Array<{ name: string; status: string; note?: string }>;
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

export function getBucketScore(
  evaluation: EvaluationInput | null | undefined,
  bucketName: string,
): number | null {
  if (!evaluation) return null;
  const bucketScores = evaluation.bucket_scores as Record<string, any> | undefined;
  if (!bucketScores) return null;
  const bucket = bucketScores[bucketName];
  if (!bucket) return null;
  const score = bucket.score;
  if (score === undefined || score === null) return null;
  if (typeof score !== 'number') return null;
  return score;
}

export function getRawSignals(evaluation: EvaluationInput | null | undefined): Array<{
  code: string;
  score?: number | null;
  priority_type?: string;
}> {
  if (!evaluation) return [];
  const bucket = evaluation.bucket_scores?.supporting_signals;
  if (!bucket) return [];
  return bucket.signals ?? [];
}

export function flattenRequirementItems(evaluation: EvaluationInput | null | undefined): Array<{
  tier: string;
  kind: string;
  name: string;
  status: string;
  note: string;
}> {
  const items: Array<{
    tier: string;
    kind: string;
    name: string;
    status: string;
    note: string;
  }> = [];

  if (!evaluation) return items;
  const reqAnalysis = evaluation.requirement_analysis ?? {};

  for (const tier of ['mandatory', 'preferred', 'bonus']) {
    const tierBlock = (reqAnalysis as any)[tier] ?? {};
    for (const kind of ['technologies', 'concepts', 'qualifications']) {
      const entries = tierBlock[kind] ?? [];
      for (const entry of entries) {
        items.push({
          tier,
          kind,
          name: entry.name ?? 'unknown',
          status: entry.status ?? 'UNKNOWN',
          note: entry.note ?? '',
        });
      }
    }
  }

  return items;
}

export function looksLikeSubstitution(note: string | null | undefined): boolean {
  if (!note) return false;
  const lowered = note.toLowerCase();
  return ['substitut', 'adjacent', 'comparable', 'offset'].some((kw) => lowered.includes(kw));
}

export function getClaimedYears(candidate: CandidateInput | null | undefined): number | null {
  if (!candidate) return null;
  const yoe = candidate.candidate_profile?.claimed_total_experience_years;
  if (yoe === undefined || yoe === null) return null;
  if (typeof yoe !== 'number') return null;
  return yoe;
}

export function getHighestEducationLevel(candidate: CandidateInput | null | undefined): number {
  if (!candidate) return 0;
  const degreeLevelMap: Record<string, number> = {
    'b.e.': 1,
    'b.tech': 1,
    bachelor: 1,
    bsc: 1,
    'b.a.': 1,
    be: 1,
    'm.e.': 2,
    'm.tech': 2,
    master: 2,
    msc: 2,
    mba: 2,
    phd: 3,
    doctorate: 3,
    dphil: 3,
  };

  let highest = 0;
  for (const edu of candidate.education ?? []) {
    const degree = edu.degree?.toLowerCase().trim() ?? '';
    for (const [key, level] of Object.entries(degreeLevelMap)) {
      if (degree.includes(key) && level > highest) {
        highest = level;
        break;
      }
    }
  }
  return highest;
}