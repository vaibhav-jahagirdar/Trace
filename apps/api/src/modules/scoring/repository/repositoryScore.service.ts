import { REPOSITORY_SCORE_POLICY } from "./repositoryScore.policy";
import { assertRepositoryReportScorable } from "./repositoryScore.guard";
import {
  RequirementContribution,
  RequirementMapping,
  RepositoryScoreInput,
  RepositoryScoreResult,
} from "./repositoryScores.types"

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}

function isPositiveScoreable(mapping: RequirementMapping): boolean {
  return (
    (mapping.assessment_scope === "REPOSITORY_VERIFIABLE" ||
      mapping.assessment_scope === "PARTIALLY_RETRIEVED") &&
    (mapping.evidence_state === "SUBSTANTIAL" ||
      mapping.evidence_state === "FUNCTIONAL" ||
      mapping.evidence_state === "SURFACE") &&
    mapping.requirement_coverage_score > 0
  );
}

function isNegativeScoreable(mapping: RequirementMapping): boolean {
  return (
    mapping.assessment_scope === "REPOSITORY_VERIFIABLE" &&
    mapping.requirement_coverage_score >=
      REPOSITORY_SCORE_POLICY.completeCoverageThreshold &&
    (mapping.evidence_state ===
      "NOT_DEMONSTRATED_IN_COMPLETE_SCOPE" ||
      mapping.evidence_state === "CONTRADICTED_BY_RETRIEVED_CODE")
  );
}

function isScoreable(mapping: RequirementMapping): boolean {
  return isPositiveScoreable(mapping) || isNegativeScoreable(mapping);
}

function requirementScoreCeilingFromCards(
  mapping: RequirementMapping,
  report: RepositoryScoreInput["report"],
): number {
  if (!isPositiveScoreable(mapping)) return 100;

  const cardsById = new Map(
    report.engineering_cards.map((card) => [card.card_id, card]),
  );

  let ceiling = 60;
  for (const cardId of mapping.linked_card_ids) {
    const card = cardsById.get(cardId);
    if (!card) continue;

    const upperBandEligible =
      mapping.requirement_coverage_score >= 80 &&
      card.assessment_scope_coverage_score >= 80 &&
      card.correctness_and_failure_handling_score >= 75 &&
      (card.system_scope_and_integration_score >= 70 ||
        card.maintainability_and_operability_score >= 70);
    const highLeverageEligible =
      mapping.requirement_coverage_score >= 90 &&
      card.assessment_scope_coverage_score >= 90 &&
      card.correctness_and_failure_handling_score >= 90 &&
      (card.system_scope_and_integration_score >= 75 ||
        card.maintainability_and_operability_score >= 75) &&
      card.evidence_strength_score >= 75;

    if (highLeverageEligible) {
      ceiling = Math.max(ceiling, 100);
    } else if (upperBandEligible) {
      ceiling = Math.max(ceiling, 89);
    } else if (
      card.implementation_depth_score > 50 ||
      card.correctness_and_failure_handling_score > 50 ||
      card.system_scope_and_integration_score > 50 ||
      card.maintainability_and_operability_score > 50
    ) {
      ceiling = Math.max(ceiling, 79);
    }
  }

  return ceiling;
}

function effectiveEvidenceScore(
  mapping: RequirementMapping,
  report: RepositoryScoreInput["report"],
): number {
  const cappedEvidenceScore = Math.min(
    mapping.requirement_evidence_score,
    requirementScoreCeilingFromCards(mapping, report),
  );
  return clamp(
    50 +
      (cappedEvidenceScore - 50) *
        (mapping.requirement_coverage_score / 100),
  );
}

export function computeRepositoryScore(
  input: RepositoryScoreInput,
): RepositoryScoreResult {
  if (!Number.isFinite(input.stage1Score) || input.stage1Score < 0 || input.stage1Score > 100) {
    throw new Error("stage1Score must be between 0 and 100");
  }

  const policyWeightTotal =
    REPOSITORY_SCORE_POLICY.repositoryEvidenceWeight +
    REPOSITORY_SCORE_POLICY.stage1Weight;
  if (
    !Number.isFinite(policyWeightTotal) ||
    Math.abs(policyWeightTotal - 1) > 0.000001
  ) {
    throw new Error("Repository scoring policy weights must sum to 1");
  }

  assertRepositoryReportScorable(input.report, input.requirements);

  const mappingByKey = new Map(
    input.report.requirement_mappings.map((mapping) => [
      `${mapping.requirement_type}\u0000${mapping.requirement_name}`,
      mapping,
    ]),
  );

  const totalRequirementWeight = input.requirements.reduce(
    (sum, item) => sum + item.weight,
    0,
  );

  if (totalRequirementWeight <= 0) {
    throw new Error("At least one positive backend requirement weight is required");
  }

  let weightedDeltaSum = 0;
  let assessedRequirementWeight = 0;
  let weightedCoverageSum = 0;
  let mandatoryCompleteNegativeCount = 0;

  const requirementContributions: RequirementContribution[] = [];

  for (const requirement of input.requirements) {
    const mapping = mappingByKey.get(
      `${requirement.type}\u0000${requirement.name}`,
    );

    if (!mapping) {
      throw new Error(`Missing mapping for ${requirement.type}:${requirement.name}`);
    }

    const includedInScore = isScoreable(mapping);
    const isCompleteNegative = isNegativeScoreable(mapping);

    if (requirement.priority === "MANDATORY" && isCompleteNegative) {
      mandatoryCompleteNegativeCount += 1;
    }

    if (!includedInScore) {
      requirementContributions.push({
        requirementName: requirement.name,
        requirementType: requirement.type,
        priority: requirement.priority,
        configuredWeight: requirement.weight,
        assessmentScope: mapping.assessment_scope,
        evidenceState: mapping.evidence_state,
        evidenceScore: mapping.requirement_evidence_score,
        coverageScore: mapping.requirement_coverage_score,
        includedInScore: false,
        effectiveEvidenceScore: null,
        weightedDelta: 0,
        exclusionReason:
          "Repository evidence is unassessable or not eligible for a score adjustment",
      });
      continue;
    }

    const effectiveScore = effectiveEvidenceScore(mapping, input.report);

    // Never renormalize to only inspected requirements.
    // Otherwise one small, observed bonus item could dominate the entire job score.
    const weightedDelta =
      ((effectiveScore - 50) * requirement.weight) / totalRequirementWeight;

    weightedDeltaSum += weightedDelta;
    assessedRequirementWeight += requirement.weight;
    weightedCoverageSum +=
      (mapping.requirement_coverage_score * requirement.weight) /
      totalRequirementWeight;

    requirementContributions.push({
      requirementName: requirement.name,
      requirementType: requirement.type,
      priority: requirement.priority,
      configuredWeight: requirement.weight,
      assessmentScope: mapping.assessment_scope,
      evidenceState: mapping.evidence_state,
      evidenceScore: mapping.requirement_evidence_score,
      coverageScore: mapping.requirement_coverage_score,
      includedInScore: true,
      effectiveEvidenceScore: effectiveScore,
      weightedDelta,
    });
  }

  const repositoryEvidenceScore = clamp(50 + weightedDeltaSum);

  // A repository with no assessable evidence is neutral and must not turn
  // Stage 1 into a 50-point score. Once any requirement is assessable, the
  // repository score is the dominant signal and the Stage 1 score contributes
  // the remaining policy weight.
  const hasAssessableRepositoryEvidence = assessedRequirementWeight > 0;
  const combinedScore = hasAssessableRepositoryEvidence
    ? repositoryEvidenceScore *
        REPOSITORY_SCORE_POLICY.repositoryEvidenceWeight +
      input.stage1Score * REPOSITORY_SCORE_POLICY.stage1Weight
    : input.stage1Score;

  const repositoryAdjustment = combinedScore - input.stage1Score;

  const directClaimContradictionCount =
    input.report.claim_verifications.filter(
      (claim) =>
        claim.repository_evidence_status ===
          "CONTRADICTED_BY_RETRIEVED_CODE" &&
        claim.assessment_scope === "REPOSITORY_VERIFIABLE" &&
        claim.claim_coverage_score >=
          REPOSITORY_SCORE_POLICY.completeCoverageThreshold,
    ).length;

  const observedMaterialRiskCount =
    input.report.material_risks.filter(
      (risk) => risk.status === "OBSERVED",
    ).length;

  return {
    policyVersion: REPOSITORY_SCORE_POLICY.version,
    stage1Score: round(input.stage1Score),
    repositoryEvidenceScore: round(repositoryEvidenceScore),
    repositoryCoverageAcrossJobRequirements: round(weightedCoverageSum),
    repositoryAdjustment: round(repositoryAdjustment),
    combinedScore: round(clamp(combinedScore)),
    assessedRequirementWeight: round(assessedRequirementWeight),
    totalRequirementWeight: round(totalRequirementWeight),
    mandatoryCompleteNegativeCount,
    directClaimContradictionCount,
    observedMaterialRiskCount,
    requirementContributions,
    auditNotes: [
      "Only requirement mappings contributed to the repository adjustment.",
      "Raised-bar card ceilings cap requirement evidence: commodity paths at 60, mechanism-only paths at 79, and upper bands require correctness, boundary-or-change evidence, and sufficient requirement and card coverage.",
      "Cards, claims, and risks are retained as audit signals and were not double-counted.",
      `Scoring blend: ${(REPOSITORY_SCORE_POLICY.repositoryEvidenceWeight * 100).toFixed(0)}% repository evidence and ${(REPOSITORY_SCORE_POLICY.stage1Weight * 100).toFixed(0)}% Stage 1.`,
      hasAssessableRepositoryEvidence
        ? "Repository evidence was assessable and used as the dominant signal."
        : "Repository evidence was unavailable or unassessable; Stage 1 remained neutral and unchanged.",
      "Weights came from backend job configuration, never from LLM output.",
    ],
  };
}
