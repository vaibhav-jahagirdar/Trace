type AnyRecord = Record<string, any>;

function asObject(value: unknown): AnyRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as AnyRecord : {};
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : value == null ? fallback : String(value);
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? [...new Set(value.filter((item): item is string => typeof item === "string" && item.trim().length > 0))] : [];
}

function asNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value: unknown, min: number, max: number): number {
  return Math.max(min, Math.min(max, asNumber(value, min)));
}

function cleanPlan(rawPlan: AnyRecord, repositories: AnyRecord[]): AnyRecord {
  const repoIds = new Map<string, string>();
  for (const repo of repositories) {
    const id = String(repo.github_repository_id);
    repoIds.set(id, id);
    repoIds.set(String(repo.full_name), id);
    repoIds.set(String(repo.repository_name), id);
  }

  const plans = (Array.isArray(rawPlan.repository_plans) ? rawPlan.repository_plans : []).map((raw: unknown) => {
    const plan = asObject(raw);
    const repositoryId = repoIds.get(asString(plan.repository_id)) ?? asString(plan.repository_id);
    const objectives = (Array.isArray(plan.evidence_objectives) ? plan.evidence_objectives : []).map((rawObjective: unknown, index: number) => {
      const objective = asObject(rawObjective);
      return {
        objective_id: asString(objective.objective_id, `objective_${String(index + 1).padStart(3, "0")}`),
        importance: ["CRITICAL", "HIGH", "MEDIUM"].includes(asString(objective.importance)) ? asString(objective.importance) : "MEDIUM",
        source_claim_ids: asStringArray(objective.source_claim_ids),
        job_requirement_names: asStringArray(objective.job_requirement_names),
        domain: asString(objective.domain, "General engineering"),
        objective: asString(objective.objective, "Retrieve implementation evidence"),
        seed_paths: asStringArray(objective.seed_paths),
        dependency_closure_policy: ["NONE", "DIRECT_LOCAL_IMPORTS", "TRANSITIVE_TO_BOUNDARY"].includes(asString(objective.dependency_closure_policy)) ? asString(objective.dependency_closure_policy) : "NONE",
        include_related_configuration: Boolean(objective.include_related_configuration),
        completion_condition: asString(objective.completion_condition, "Evidence retrieved for review"),
        selection_rationale: asString(objective.selection_rationale, "Relevant to the role"),
      };
    });
    const disposition = asString(plan.retrieval_disposition);
    return {
      repository_id: repositoryId,
      repository_name: asString(plan.repository_name, repositories.find((repo) => String(repo.github_repository_id) === repositoryId)?.repository_name ?? repositoryId),
      stage_1_relationship: ["MATCHED", "POSSIBLE_MATCH", "UNLINKED", "NO_STAGE_1_PROJECT"].includes(asString(plan.stage_1_relationship)) ? asString(plan.stage_1_relationship) : "UNLINKED",
      linked_stage_1_project_ids: asStringArray(plan.linked_stage_1_project_ids),
      retrieval_disposition: ["REQUIRED", "EXPLORATORY", "SKIP"].includes(disposition) ? disposition : "EXPLORATORY",
      evidence_priority: ["CRITICAL", "HIGH", "MEDIUM", "LOW"].includes(asString(plan.evidence_priority)) ? asString(plan.evidence_priority) : "LOW",
      candidate_attention_weight: disposition === "SKIP" ? 0 : clamp(plan.candidate_attention_weight, 0, 100),
      planning_confidence: ["HIGH", "MEDIUM", "LOW"].includes(asString(plan.planning_confidence)) ? asString(plan.planning_confidence) : "MEDIUM",
      priority_rationale: asString(plan.priority_rationale, "Planner-selected repository"),
      structural_observations: Array.isArray(plan.structural_observations) ? plan.structural_observations.map((item: unknown) => {
        const observation = asObject(item);
        return { observation: asString(observation.observation), evidence_paths: asStringArray(observation.evidence_paths) };
      }) : [],
      domain_allocations: Array.isArray(plan.domain_allocations) ? plan.domain_allocations.map((item: unknown) => {
        const allocation = asObject(item);
        return { domain: asString(allocation.domain, "General engineering"), attention_weight: clamp(allocation.attention_weight, 0, 100), rationale: asString(allocation.rationale), evidence_paths: asStringArray(allocation.evidence_paths) };
      }) : [],
      evidence_objectives: objectives,
    };
  });

  return {
    metadata: asObject(rawPlan.metadata),
    planning_summary: asObject(rawPlan.planning_summary),
    repository_plans: plans,
    target_coverage: Array.isArray(rawPlan.target_coverage) ? rawPlan.target_coverage : [],
    retrieval_execution: asObject(rawPlan.retrieval_execution),
  };
}

export interface CleanPlannerResponse {
  plan: AnyRecord;
  repositoryDiscovery: AnyRecord[];
  rawLlmResponse: string;
}

/** Defensive normalization only; Python remains the authoritative planner. */
export function cleanPlannerResponse(response: AnyRecord): CleanPlannerResponse {
  const discovery = asObject(response.repository_discovery);
  const repositories = Array.isArray(discovery.repositories) ? discovery.repositories : [];
  const normalized = repositories.map((repo: AnyRecord) => {
    const owner = String(repo.owner ?? "");
    const name = String(repo.name ?? repo.repository_name ?? "");
    const id = Number(repo.github_repository_id ?? repo.id);
    const tree = repo.tree ?? { name: `${owner}/${name}`, type: "directory", path: "", children: [] };
    return {
      github_repository_id: Number.isSafeInteger(id) ? id : 0,
      owner,
      repository_name: name,
      full_name: repo.full_name ?? `${owner}/${name}`,
      repository_url: repo.repository_url ?? `https://github.com/${owner}/${name}`,
      classification: repo.classification ?? (repo.fork ? "FORK" : "SELF_OWNED"),
      default_branch: repo.default_branch ?? "main",
      description: repo.description ?? null,
      primary_language: repo.primary_language ?? Object.keys(repo.languages ?? {})[0] ?? null,
      languages: repo.languages ?? {},
      topics: repo.topics ?? [],
      metadata: repo.metadata ?? { private: repo.private ?? false, archived: repo.archived ?? false },
      architecture_tree: tree,
      repository_statistics: repo.statistics ?? {},
    };
  }).filter((repo) => repo.github_repository_id > 0 && repo.owner && repo.repository_name);
  return {
    plan: cleanPlan(asObject(response.plan), normalized),
    repositoryDiscovery: normalized,
    rawLlmResponse: typeof response.raw_llm_response === "string"
      ? response.raw_llm_response
      : JSON.stringify(response.raw_llm_response ?? response),
  };
}
