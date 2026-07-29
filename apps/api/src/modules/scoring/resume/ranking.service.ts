

import { STAGE2_ADMISSION_RATE } from './scoring.constants';
import {
  ScoreResult,
  PipelineStatus,
  RankedCandidate,
  RankingReport,
} from './scoring.models';

export function rankAndAdmit(
  results: ScoreResult[],
  admissionRate: number = STAGE2_ADMISSION_RATE,
): RankingReport {
  const scored: ScoreResult[] = [];
  const disqualified: ScoreResult[] = [];
  const quarantined: ScoreResult[] = [];

  for (const r of results) {
    if (r.status === 'SCORED') {
      scored.push(r);
    } else if (r.status === 'DISQUALIFIED') {
      disqualified.push(r);
    } else if (r.status === 'QUARANTINED') {
      quarantined.push(r);
    }
  }

  scored.sort((a, b) => (b.resume_match_score ?? 0) - (a.resume_match_score ?? 0));

  const n = scored.length;
  const cutoffIndex = n > 0 ? Math.max(0, Math.round(n * admissionRate)) : 0;

  const admitted: RankedCandidate[] = [];
  const rejected: RankedCandidate[] = [];

  scored.forEach((r, i) => {
    if (!r) return;
    const score = r.resume_match_score ?? 0;
    const percentile = n > 0 ? 1 - (i / n) : 0;
    const admittedToStage2 = i < cutoffIndex;

    const ranked: RankedCandidate = {
      candidate_ref: r.candidate_ref,
      resume_match_score: score,
      rank: i + 1,
      percentile: Math.round(percentile * 10000) / 10000,
      admitted_to_stage2: admittedToStage2,
    };

    if (admittedToStage2) {
      admitted.push(ranked);
    } else {
      rejected.push(ranked);
    }
  });

  return {
    admitted,
    rejected,
    disqualified,
    quarantined,
  };
}