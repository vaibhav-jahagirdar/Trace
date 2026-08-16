export type AssessmentScope =
  | "REPOSITORY_VERIFIABLE"
  | "PARTIALLY_RETRIEVED"
  | "UNAVAILABLE_OR_PRIVATE"
  | "OUTSIDE_REPOSITORY_SCOPE"
  | "NOT_APPLICABLE";

export type RequirementEvidenceState =
  | "SUBSTANTIAL"
  | "FUNCTIONAL"
  | "SURFACE"
  | "NOT_DEMONSTRATED_IN_COMPLETE_SCOPE"
  | "UNASSESSABLE_FROM_REPOSITORY"
  | "NOT_APPLICABLE"
  | "CONTRADICTED_BY_RETRIEVED_CODE";

export interface RequirementMapping {
  requirement_name: string;
  requirement_type: string;
  priority_type: "MANDATORY" | "PREFERRED" | "BONUS" | "UNWEIGHTED";
  assessment_scope: AssessmentScope;
  linked_card_ids: string[];
  supporting_finding_ids: string[];
  requirement_evidence_score: number;
  requirement_coverage_score: number;
  evidence_state: RequirementEvidenceState;
  scope_note: string;
}

export interface ClaimVerification {
  claim_id: string;
  assessment_scope: AssessmentScope;
  claim_support_score: number;
  claim_coverage_score: number;
  repository_evidence_status: string;
  linked_card_ids: string[];
  supporting_finding_ids: string[];
  scope_note: string;
}

export interface MaterialRisk {
  risk_id: string;
  category: string;
  impact_score: number;
  evidence_strength_score: number;
  scope_coverage_score: number;
  severity: "BLOCKING" | "HIGH" | "MEDIUM" | "LOW";
  status: "OBSERVED" | "UNRESOLVED" | "NOT_ASSESSABLE";
  supporting_finding_ids: string[];
  linked_card_ids: string[];
  description: string;
}

export interface RepositoryVerifierReport {
  metadata: {
    schema_version: "v1";
  };
  evidence_ledger: Array<{
    finding_id: string;
  }>;
  objective_coverage: Array<{
    objective_id: string;
    status: string;
    finding_ids: string[];
    limitation: string | null;
  }>;
  engineering_cards: Array<{
    card_id: string;
    supporting_finding_ids: string[];
    evidence_strength_score: number;
    assessment_scope_coverage_score: number;
  }>;
  requirement_mappings: RequirementMapping[];
  claim_verifications: ClaimVerification[];
  material_risks: MaterialRisk[];
  analysis_limitations: string[];
}

export interface CanonicalJobRequirement {
  name: string;
  type: string;
  priority: "MANDATORY" | "PREFERRED" | "BONUS" | "UNWEIGHTED";
  weight: number;
}

export interface RepositoryScoreInput {
  applicationId: string;
  stage1Score: number;
  requirements: CanonicalJobRequirement[];
  report: RepositoryVerifierReport;

  provenance: {
    stage1ReportHash: string;
    stage2aReportHash: string;
    repositorySnapshotManifestHash: string;
    verifierReportHash: string;
    verifierPromptVersion: string;
    verifierModel: string;
  };
}

export interface RequirementContribution {
  requirementName: string;
  requirementType: string;
  priority: CanonicalJobRequirement["priority"];
  configuredWeight: number;

  assessmentScope: AssessmentScope;
  evidenceState: RequirementEvidenceState;
  evidenceScore: number;
  coverageScore: number;

  includedInScore: boolean;
  effectiveEvidenceScore: number | null;
  weightedDelta: number;
  exclusionReason?: string;
}

export interface RepositoryScoreResult {
  policyVersion: string;

  stage1Score: number;
  repositoryEvidenceScore: number;
  repositoryCoverageAcrossJobRequirements: number;
  repositoryAdjustment: number;
  combinedScore: number;

  assessedRequirementWeight: number;
  totalRequirementWeight: number;

  mandatoryCompleteNegativeCount: number;
  directClaimContradictionCount: number;
  observedMaterialRiskCount: number;

  requirementContributions: RequirementContribution[];
  auditNotes: string[];
}