import { REPOSITORY_SCORE_POLICY } from "./repositoryScore.policy";
import { RepositoryScoreResult } from "./repositoryScores.types";

export interface RankedRepositoryCandidate {
  applicationId: string;
  score: RepositoryScoreResult;
}

export interface FinalShortlistResult {
  policyVersion: string;
  cohortSize: number;
  targetCount: number;
  automaticallyRecommended: RankedRepositoryCandidate[];
  evidenceEquivalentAtCutoff: RankedRepositoryCandidate[];
  notAutomaticallyRecommended: RankedRepositoryCandidate[];
}

function mandatoryEvidence(
  candidate: RankedRepositoryCandidate,
): number {
  return candidate.score.requirementContributions
    .filter(
      (item) =>
        item.priority === "MANDATORY" &&
        item.includedInScore &&
        item.effectiveEvidenceScore !== null,
    )
    .reduce(
      (sum, item) =>
        sum + (item.effectiveEvidenceScore ?? 0) * item.configuredWeight,
      0,
    );
}

function mandatoryCoverage(
  candidate: RankedRepositoryCandidate,
): number {
  return candidate.score.requirementContributions
    .filter((item) => item.priority === "MANDATORY")
    .reduce(
      (sum, item) => sum + item.coverageScore * item.configuredWeight,
      0,
    );
}

function compareCandidates(
  left: RankedRepositoryCandidate,
  right: RankedRepositoryCandidate,
): number {
  return (
    right.score.combinedScore - left.score.combinedScore ||
    mandatoryEvidence(right) - mandatoryEvidence(left) ||
    mandatoryCoverage(right) - mandatoryCoverage(left) ||
    right.score.assessedRequirementWeight -
      left.score.assessedRequirementWeight ||
    right.score.repositoryCoverageAcrossJobRequirements -
      left.score.repositoryCoverageAcrossJobRequirements
  );
}

function isEvidenceEquivalent(
  left: RankedRepositoryCandidate,
  right: RankedRepositoryCandidate,
): boolean {
  return compareCandidates(left, right) === 0;
}

export function buildFinalInterviewShortlist(
  candidates: RankedRepositoryCandidate[],
): FinalShortlistResult {
  const ranked = [...candidates].sort(compareCandidates);

  if (
    REPOSITORY_SCORE_POLICY.finalInterviewRate <= 0 ||
    REPOSITORY_SCORE_POLICY.finalInterviewRate > 1
  ) {
    throw new Error(
      "finalInterviewRate must be greater than 0 and at most 1",
    );
  }

  const targetCount = Math.ceil(
    ranked.length * REPOSITORY_SCORE_POLICY.finalInterviewRate,
  );

  if (
    ranked.length === 0 ||
    targetCount <= 0 ||
    targetCount > ranked.length
  ) {
    return {
      policyVersion: REPOSITORY_SCORE_POLICY.version,
      cohortSize: ranked.length,
      targetCount: 0,
      automaticallyRecommended: [],
      evidenceEquivalentAtCutoff: [],
      notAutomaticallyRecommended: ranked,
    };
  }

  const cutoff = ranked[targetCount - 1];

  if (!cutoff) {
    return {
      policyVersion: REPOSITORY_SCORE_POLICY.version,
      cohortSize: ranked.length,
      targetCount: 0,
      automaticallyRecommended: [],
      evidenceEquivalentAtCutoff: [],
      notAutomaticallyRecommended: ranked,
    };
  }

  let tieStart = targetCount - 1;

  while (tieStart > 0) {
    const previous = ranked[tieStart - 1];

    if (!previous || !isEvidenceEquivalent(previous, cutoff)) {
      break;
    }

    tieStart -= 1;
  }

  let tieEnd = targetCount;

  while (tieEnd < ranked.length) {
    const next = ranked[tieEnd];

    if (!next || !isEvidenceEquivalent(next, cutoff)) {
      break;
    }

    tieEnd += 1;
  }

  const tieCrossesCutoff =
    tieStart < targetCount && tieEnd > targetCount;

  return {
    policyVersion: REPOSITORY_SCORE_POLICY.version,
    cohortSize: ranked.length,
    targetCount,

    automaticallyRecommended: tieCrossesCutoff
      ? ranked.slice(0, tieStart)
      : ranked.slice(0, targetCount),

    evidenceEquivalentAtCutoff: tieCrossesCutoff
      ? ranked.slice(tieStart, tieEnd)
      : [],

    notAutomaticallyRecommended: tieCrossesCutoff
      ? ranked.slice(tieEnd)
      : ranked.slice(targetCount),
  };
}