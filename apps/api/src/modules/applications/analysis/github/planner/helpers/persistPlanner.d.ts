import { PoolClient } from "pg";
interface TreeNode {
    name: string;
    type: "file" | "directory" | "submodule";
    path: string;
    children?: TreeNode[];
}
interface RepositoryDiscovery {
    github_repository_id: number;
    owner: string;
    repository_name: string;
    full_name: string;
    repository_url: string;
    classification: "SELF_OWNED" | "FORK" | "ORGANIZATION";
    default_branch: string;
    description: string | null;
    primary_language: string | null;
    languages: Record<string, number>;
    topics: string[];
    metadata: Record<string, unknown>;
    architecture_tree: TreeNode;
    repository_statistics: Record<string, unknown>;
}
interface EvidenceObjective {
    objective_id: string;
    importance: "CRITICAL" | "HIGH" | "MEDIUM";
    source_claim_ids: string[];
    job_requirement_names: string[];
    domain: string;
    objective: string;
    seed_paths: string[];
    dependency_closure_policy: "NONE" | "DIRECT_LOCAL_IMPORTS" | "TRANSITIVE_TO_BOUNDARY";
    include_related_configuration: boolean;
    completion_condition: string;
    selection_rationale: string;
}
interface RepositoryPlan {
    repository_id: string;
    repository_name: string;
    stage_1_relationship: "MATCHED" | "POSSIBLE_MATCH" | "UNLINKED" | "NO_STAGE_1_PROJECT";
    linked_stage_1_project_ids: string[];
    retrieval_disposition: "REQUIRED" | "EXPLORATORY" | "SKIP";
    evidence_priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    candidate_attention_weight: number;
    planning_confidence: "HIGH" | "MEDIUM" | "LOW";
    priority_rationale: string;
    structural_observations: any[];
    domain_allocations: any[];
    evidence_objectives: EvidenceObjective[];
}
interface PlanningSummary {
    stage_1_anchor_check: string;
    discovery_quality: "HIGH" | "MEDIUM" | "LOW";
    material_data_gaps: string[];
}
interface RepositoryAnalysisOutput {
    metadata: {
        schema_version: string;
    };
    planning_summary: PlanningSummary;
    repository_plans: RepositoryPlan[];
    target_coverage: any[];
    retrieval_execution: any;
}
export declare function persistRepositoryAnalysis(client: PoolClient, applicationTaskId: string, analysisData: RepositoryAnalysisOutput, repositoryDiscovery: RepositoryDiscovery[], plannerModel: string, plannerPromptVersion: string, plannerInputHash: string, planningStartedAt: Date): Promise<void>;
export {};
//# sourceMappingURL=persistPlanner.d.ts.map