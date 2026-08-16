import { REPOSITORY_SCORE_POLICY } from "./repositoryScore.policy";
import { RepositoryScoreResult } from "./repositoryScores.types";

export interface ShortlistCandidate {
  applicationId: string;
  score: RepositoryScoreResult;
}

export interface ShortlistResult {
  recommended: ShortlistCandidate[];
  cutoffTieReview: ShortlistCandidate[];
  notRecommended: ShortlistCandidate[];
  targetCount: number;
  cutoffScore: number | null;
}

function mandatoryEvidence(candidate: ShortlistCandidate): number {
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

function mandatoryCoverage(candidate: ShortlistCandidate): number {
  return candidate.score.requirementContributions
    .filter((item) => item.priority === "MANDATORY")
    .reduce(
      (sum, item) => sum + item.coverageScore * item.configuredWeight,
      0,
    );
}

function compareCandidates(
  left: ShortlistCandidate,
  right: ShortlistCandidate,
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

function evidenceEquivalent(
  left: ShortlistCandidate,
  right: ShortlistCandidate,
): boolean {
  return compareCandidates(left, right) === 0;
}

export function buildFinalInterviewShortlist(
  candidates: ShortlistCandidate[],
): ShortlistResult {
  const ranked = [...candidates].sort(compareCandidates);
  const rate = REPOSITORY_SCORE_POLICY.finalInterviewRate;

  if (rate <= 0 || rate > 1) {
    throw new Error(
      "REPOSITORY_SCORE_POLICY.finalInterviewRate must be greater than 0 and at most 1",
    );
  }

  const targetCount = Math.ceil(ranked.length * rate);

  if (
    ranked.length === 0 ||
    targetCount <= 0 ||
    targetCount > ranked.length
  ) {
    return {
      recommended: [],
      cutoffTieReview: [],
      notRecommended: ranked,
      targetCount: 0,
      cutoffScore: null,
    };
  }

  const cutoffCandidate = ranked[targetCount - 1];

  if (!cutoffCandidate) {
    return {
      recommended: [],
      cutoffTieReview: [],
      notRecommended: ranked,
      targetCount: 0,
      cutoffScore: null,
    };
  }

  let tieStart = targetCount - 1;

  while (tieStart > 0) {
    const previousCandidate = ranked[tieStart - 1];

    if (
      previousCandidate === undefined ||
      !evidenceEquivalent(previousCandidate, cutoffCandidate)
    ) {
      break;
    }

    tieStart -= 1;
  }

  let tieEnd = targetCount;

  while (tieEnd < ranked.length) {
    const nextCandidate = ranked[tieEnd];

    if (
      nextCandidate === undefined ||
      !evidenceEquivalent(nextCandidate, cutoffCandidate)
    ) {
      break;
    }

    tieEnd += 1;
  }

  const tieCrossesCutoff =
    tieStart < targetCount && tieEnd > targetCount;

  return {
    recommended: tieCrossesCutoff
      ? ranked.slice(0, tieStart)
      : ranked.slice(0, targetCount),

    cutoffTieReview: tieCrossesCutoff
      ? ranked.slice(tieStart, tieEnd)
      : [],

    notRecommended: tieCrossesCutoff
      ? ranked.slice(tieEnd)
      : ranked.slice(targetCount),

    targetCount,
    cutoffScore: cutoffCandidate.score.combinedScore,
  };
}