import {
  AssessmentScope,
  CanonicalJobRequirement,
  RepositoryVerifierReport,
  RequirementEvidenceState,
} from "./repositoryScores.types"

export class RepositoryScoreContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RepositoryScoreContractError";
  }
}

function requirementKey(type: string, name: string): string {
  return `${type}\u0000${name}`;
}

function assertIntegerScore(
  value: unknown,
  label: string,
): asserts value is number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 0 ||
    value > 100
  ) {
    throw new RepositoryScoreContractError(
      `${label} must be an integer from 0 through 100`,
    );
  }
}
function allowedStates(scope: AssessmentScope): readonly RequirementEvidenceState[] {
  switch (scope) {
    case "REPOSITORY_VERIFIABLE":
      return [
        "SUBSTANTIAL",
        "FUNCTIONAL",
        "SURFACE",
        "NOT_DEMONSTRATED_IN_COMPLETE_SCOPE",
        "CONTRADICTED_BY_RETRIEVED_CODE",
      ];

    case "PARTIALLY_RETRIEVED":
      return [
        "SUBSTANTIAL",
        "FUNCTIONAL",
        "SURFACE",
        "UNASSESSABLE_FROM_REPOSITORY",
      ];

    case "UNAVAILABLE_OR_PRIVATE":
    case "OUTSIDE_REPOSITORY_SCOPE":
      return ["UNASSESSABLE_FROM_REPOSITORY"];

    case "NOT_APPLICABLE":
      return ["NOT_APPLICABLE"];
  }
}

export function assertRepositoryReportScorable(
  report: RepositoryVerifierReport,
  requirements: CanonicalJobRequirement[],
): void {
  if (report.metadata?.schema_version !== "v1") {
    throw new RepositoryScoreContractError(
      `Unsupported verifier schema: ${report.metadata?.schema_version}`,
    );
  }

  if (!Number.isFinite(requirements.reduce((sum, item) => sum + item.weight, 0))) {
    throw new RepositoryScoreContractError("Requirement weights are not finite");
  }

  const expected = new Map(
    requirements.map((item) => [
      requirementKey(item.type, item.name),
      item,
    ]),
  );

  const findingIds = new Set<string>();
  for (const finding of report.evidence_ledger) {
    if (findingIds.has(finding.finding_id)) {
      throw new RepositoryScoreContractError(
        `Duplicate finding_id: ${finding.finding_id}`,
      );
    }
    findingIds.add(finding.finding_id);
  }

  const cardIds = new Set<string>();
  for (const card of report.engineering_cards) {
    if (cardIds.has(card.card_id)) {
      throw new RepositoryScoreContractError(
        `Duplicate card_id: ${card.card_id}`,
      );
    }
    cardIds.add(card.card_id);

    for (const findingId of card.supporting_finding_ids) {
      if (!findingIds.has(findingId)) {
        throw new RepositoryScoreContractError(
          `Card ${card.card_id} references unknown finding ${findingId}`,
        );
      }
    }
  }

  const seenMappings = new Set<string>();

  for (const mapping of report.requirement_mappings) {
    const key = requirementKey(
      mapping.requirement_type,
      mapping.requirement_name,
    );

    const configured = expected.get(key);
    if (!configured) {
      throw new RepositoryScoreContractError(
        `Unknown requirement mapping: ${mapping.requirement_type}:${mapping.requirement_name}`,
      );
    }

    if (seenMappings.has(key)) {
      throw new RepositoryScoreContractError(
        `Duplicate requirement mapping: ${mapping.requirement_type}:${mapping.requirement_name}`,
      );
    }
    seenMappings.add(key);

    if (mapping.priority_type !== configured.priority) {
      throw new RepositoryScoreContractError(
        `Priority mismatch for ${mapping.requirement_name}`,
      );
    }

    assertIntegerScore(
      mapping.requirement_evidence_score,
      `${mapping.requirement_name} evidence score`,
    );
    assertIntegerScore(
      mapping.requirement_coverage_score,
      `${mapping.requirement_name} coverage score`,
    );

    if (!allowedStates(mapping.assessment_scope).includes(mapping.evidence_state)) {
      throw new RepositoryScoreContractError(
        `Invalid scope/state combination for ${mapping.requirement_name}`,
      );
    }

    const mustBeNeutral =
      mapping.assessment_scope === "UNAVAILABLE_OR_PRIVATE" ||
      mapping.assessment_scope === "OUTSIDE_REPOSITORY_SCOPE" ||
      mapping.assessment_scope === "NOT_APPLICABLE" ||
      mapping.evidence_state === "UNASSESSABLE_FROM_REPOSITORY";

    if (
      mustBeNeutral &&
      (mapping.requirement_evidence_score !== 50 ||
        mapping.requirement_coverage_score !== 0)
    ) {
      throw new RepositoryScoreContractError(
        `Unassessable requirement ${mapping.requirement_name} must use 50/0`,
      );
    }

    const completeNegative =
      mapping.evidence_state === "NOT_DEMONSTRATED_IN_COMPLETE_SCOPE" ||
      mapping.evidence_state === "CONTRADICTED_BY_RETRIEVED_CODE";

    if (
      completeNegative &&
      (mapping.assessment_scope !== "REPOSITORY_VERIFIABLE" ||
        mapping.requirement_coverage_score < 90)
    ) {
      throw new RepositoryScoreContractError(
        `Complete negative ${mapping.requirement_name} lacks complete scope`,
      );
    }

    for (const findingId of mapping.supporting_finding_ids) {
      if (!findingIds.has(findingId)) {
        throw new RepositoryScoreContractError(
          `Requirement ${mapping.requirement_name} references unknown finding ${findingId}`,
        );
      }
    }

    for (const cardId of mapping.linked_card_ids) {
      if (!cardIds.has(cardId)) {
        throw new RepositoryScoreContractError(
          `Requirement ${mapping.requirement_name} references unknown card ${cardId}`,
        );
      }
    }
  }

  for (const requirement of requirements) {
    const key = requirementKey(requirement.type, requirement.name);

    if (!seenMappings.has(key)) {
      throw new RepositoryScoreContractError(
        `Verifier omitted requirement: ${requirement.type}:${requirement.name}`,
      );
    }

    if (!Number.isFinite(requirement.weight) || requirement.weight < 0) {
      throw new RepositoryScoreContractError(
        `Invalid backend weight for ${requirement.name}`,
      );
    }
  }
}