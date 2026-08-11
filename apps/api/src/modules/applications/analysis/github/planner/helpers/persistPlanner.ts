import { PoolClient } from "pg";
import { AppError } from "../../../../../../middleware/errorHandler";



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
  metadata: { schema_version: string };
  planning_summary: PlanningSummary;
  repository_plans: RepositoryPlan[];
  target_coverage: any[];
  retrieval_execution: any;
}

function buildPathTypeMap(root: TreeNode): Map<string, "FILE" | "DIRECTORY"> {
  const map = new Map<string, "FILE" | "DIRECTORY">();

  function walk(node: TreeNode) {
    if (node.path && node.type) {
      const type = node.type === "file" ? "FILE" : "DIRECTORY";
      map.set(node.path, type);
    }
    if (node.children) {
      for (const child of node.children) {
        walk(child);
      }
    }
  }

  walk(root);
  return map;
}


export async function persistRepositoryAnalysis(
  client: PoolClient,
  applicationTaskId: string,
  analysisData: RepositoryAnalysisOutput,
  repositoryDiscovery: RepositoryDiscovery[],
  plannerModel: string,
  plannerPromptVersion: string,
  plannerInputHash: string,
  planningStartedAt: Date,
): Promise<void> {

  const discoveryMap = new Map<number, RepositoryDiscovery>();
  for (const disc of repositoryDiscovery) {
    discoveryMap.set(disc.github_repository_id, disc);
  }

  const now = new Date();


  await client.query(
    `DELETE FROM application_repositories WHERE application_repository_analysis_id = (
       SELECT id FROM application_repository_analyses WHERE application_task_id = $1
     )`,
    [applicationTaskId],
  );


  const analysisInsertQuery = `
    INSERT INTO application_repository_analyses (
      application_task_id,
      planner_model,
      planner_prompt_version,
      planner_input_hash,
      planner_output,
      planning_started_at,
      planning_completed_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (application_task_id) DO UPDATE
    SET
      planner_model = EXCLUDED.planner_model,
      planner_prompt_version = EXCLUDED.planner_prompt_version,
      planner_input_hash = EXCLUDED.planner_input_hash,
      planner_output = EXCLUDED.planner_output,
      planning_started_at = COALESCE(application_repository_analyses.planning_started_at, EXCLUDED.planning_started_at),
      planning_completed_at = EXCLUDED.planning_completed_at
    RETURNING id
  `;
  const analysisResult = await client.query<{ id: string }>(analysisInsertQuery, [
    applicationTaskId,
    plannerModel,
    plannerPromptVersion,
    plannerInputHash,
    analysisData,
    planningStartedAt,
    now,
  ]);
  if(analysisResult.rowCount === 0 || !analysisResult.rows[0]) {
    throw new AppError(
      `Failed to insert/update repository analysis for task ${applicationTaskId}`,
      500,
    )
  }
  const analysisId = analysisResult.rows[0].id;
  

  for (const plan of analysisData.repository_plans) {

    const githubRepoId = Number(plan.repository_id);
    if (!Number.isSafeInteger(githubRepoId) || githubRepoId <= 0) {
      throw new AppError(
        `Invalid repository_id: ${plan.repository_id} – must be a positive integer`,
        400,
      );
    }

    const discovery = discoveryMap.get(githubRepoId);
    if (!discovery) {
      throw new AppError(
        `Discovery missing for repository ${plan.repository_id}`,
        404,
      );
    }

    // Map retrieval_disposition
    let dbDisposition: "ANALYZE" | "EXPLORE" | "SKIP";
    switch (plan.retrieval_disposition) {
      case "REQUIRED":    dbDisposition = "ANALYZE"; break;
      case "EXPLORATORY": dbDisposition = "EXPLORE"; break;
      case "SKIP":        dbDisposition = "SKIP";    break;
      default:
        throw new AppError(
          `Unknown retrieval disposition: ${plan.retrieval_disposition}`,
          400,
        );
    }

    // Insert repository
    const repoInsertQuery = `
      INSERT INTO application_repositories (
        application_repository_analysis_id,
        github_repository_id,
        owner,
        repository_name,
        full_name,
        repository_url,
        classification,
        default_branch,
        description,
        primary_language,
        languages,
        topics,
        metadata,
        architecture_tree,
        repository_statistics,
        retrieval_disposition,
        repository_attention_weight,
        priority_rationale,
        stage_1_relationship,
        planning_confidence,
        evidence_priority,
        linked_stage_1_project_ids
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING id
    `;
    const repoResult = await client.query<{ id: string }>(repoInsertQuery, [
      analysisId,
      githubRepoId,
      discovery.owner,
      discovery.repository_name,
      discovery.full_name,
      discovery.repository_url,
      discovery.classification,
      discovery.default_branch,
      discovery.description,
      discovery.primary_language,
      discovery.languages,
      discovery.topics,
      discovery.metadata,
      discovery.architecture_tree,
      discovery.repository_statistics,
      dbDisposition,
      plan.candidate_attention_weight,
      plan.priority_rationale,
      plan.stage_1_relationship,
      plan.planning_confidence,
      plan.evidence_priority,
      plan.linked_stage_1_project_ids,
    ]);
    if(repoResult.rowCount === 0 || !repoResult.rows[0]) {
        throw new AppError(
          `Failed to insert repository ${plan.repository_id}`,
          500,
        )
    }
    const repoUuid = repoResult.rows[0].id;

    // Build path→type map once per repository
    const pathTypeMap = buildPathTypeMap(discovery.architecture_tree);

    // Process evidence objectives
    const objectives = plan.evidence_objectives || [];
    const seenObjectiveIds = new Set<string>();

    for (let idx = 0; idx < objectives.length; idx++) {
      const obj = objectives[idx];

      // Guard against undefined entries (TypeScript safety)
      if (!obj) {
        throw new AppError(
          `Objective at index ${idx} is undefined for repository ${plan.repository_id}`,
          400,
        );
      }

      // Check duplicate objective_id
      if (seenObjectiveIds.has(obj.objective_id)) {
        throw new AppError(
          `Duplicate objective_id: ${obj.objective_id}`,
          400,
        );
      }
      seenObjectiveIds.add(obj.objective_id);

      // Validate importance
      let priority: number;
      switch (obj.importance) {
        case "CRITICAL": priority = 0.9; break;
        case "HIGH":     priority = 0.7; break;
        case "MEDIUM":   priority = 0.5; break;
        default:
          throw new AppError(
            `Unknown importance: ${obj.importance}`,
            400,
          );
      }

      const verificationGoal = obj.objective;

      // Insert objective
      const objectiveInsertQuery = `
        INSERT INTO application_repository_objectives (
          application_repository_id,
          objective_order,
          title,
          domain,
          importance,
          verification_goal,
          dependency_policy,
          completion_condition,
          planner_objective_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `;
      const objResult = await client.query<{ id: string }>(objectiveInsertQuery, [
        repoUuid,
        idx + 1,
        obj.objective,
        obj.domain,
        obj.importance,
        verificationGoal,
        obj.dependency_closure_policy,
        obj.completion_condition,
        obj.objective_id,
      ]);
      if (objResult.rowCount === 0 || !objResult.rows[0]) {
        throw new AppError(
          `Failed to insert objective ${obj.objective_id} for repository ${plan.repository_id}`,
          500,
        )
      }
      const objectiveUuid = objResult.rows[0].id;

      // Deduplicate seed paths
      const uniquePaths = [...new Set(obj.seed_paths)];

      // Insert paths
      for (const path of uniquePaths) {
        const pathType = pathTypeMap.get(path);
        if (!pathType) {
          throw new AppError(
            `Path "${path}" not found in architecture tree for repository ${plan.repository_id}`,
            400,
          );
        }

        const reason = obj.selection_rationale || "Seed path for objective";
        const followDeps = obj.dependency_closure_policy !== "NONE";

        const pathInsertQuery = `
          INSERT INTO application_repository_paths (
            application_repository_objective_id,
            repository_path,
            path_type,
            retrieval_priority,
            retrieval_reason,
            follow_dependencies
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `;
        await client.query(pathInsertQuery, [
          objectiveUuid,
          path,
          pathType,
          priority,
          reason,
          followDeps,
        ]);
      }
    }
  }

  // Structural observations intentionally kept only in planner_output
}