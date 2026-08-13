import { PoolClient } from "pg";
import { CandidateExtractionOutput } from "../../../validators/candidateExtraction";
import { ResumeEvaluationReportLLMOutput } from "../../../validators/evaluationReport";
import { normalizeTechnology } from "./normalizeTech";
import { AppError } from "../../../../../../middleware/errorHandler";

export async function persistCandidateAnalysis(
  client: PoolClient,
  resumeAnalysisId: string,
  jobApplicationId: string,
  candidate: CandidateExtractionOutput,
  evaluation: ResumeEvaluationReportLLMOutput,
): Promise<void> {
 
  const technologies = candidate.technologies ?? [];
  if (technologies.length > 0) {
    const normalizedToRaw = new Map<string, string>();
    for (const tech of technologies) {
      const raw = tech.normalized_name || "";
      if (!raw.trim()) continue;
      const key = normalizeTechnology(raw.toLowerCase());
      if (!normalizedToRaw.has(key)) normalizedToRaw.set(key, raw);
    }
    const normalizedKeys = Array.from(normalizedToRaw.keys());
    if (normalizedKeys.length > 0) {
      const lookupMap = await lookupTechnologies(client, normalizedKeys);
      const resolvedIds: string[] = [];
      const unresolved: Array<{ raw: string; key: string }> = [];
      for (const [key, raw] of normalizedToRaw.entries()) {
        const id = lookupMap.get(key);
        if (id) resolvedIds.push(id);
        else unresolved.push({ raw, key });
      }
      if (resolvedIds.length > 0) {
        await insertResolvedTechnologies(client, jobApplicationId, resolvedIds);
      }
      if (unresolved.length > 0) {
        await insertUnresolvedTechnologies(client, jobApplicationId, unresolved);
      }
    }
  }

 
  const concepts = candidate.concepts ?? [];
  if (concepts.length > 0) {
    await persistConcepts(client, jobApplicationId, concepts);
  }

  // application_claims.parent_project_id references application_projects.id,
  // not application_claims.id. Create the project containers first so child
  // claims can safely reference the real project row.
  await persistProjectContainers(client, resumeAnalysisId, candidate);
  await persistClaims(client, resumeAnalysisId, candidate);

  
  await persistWorkExperiences(client, resumeAnalysisId, candidate);

 
  await persistProjects(client, resumeAnalysisId, candidate, evaluation);

 
  await persistRequirementResults(client, resumeAnalysisId, evaluation);

 
  await persistBucketScores(client, resumeAnalysisId, evaluation);

  await persistScoreRationale(client, resumeAnalysisId, evaluation);

  await persistVerificationTargets(client, resumeAnalysisId, evaluation);
}

async function persistProjectContainers(
  client: PoolClient,
  resumeAnalysisId: string,
  candidate: CandidateExtractionOutput,
): Promise<void> {
  for (const project of candidate.projects ?? []) {
    await client.query(
      `INSERT INTO application_projects (resume_analysis_id, claim_id, title, description, role, domain, repository_url, confidence)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (resume_analysis_id, claim_id) DO UPDATE
       SET title = EXCLUDED.title, description = EXCLUDED.description,
           role = EXCLUDED.role, domain = EXCLUDED.domain,
           repository_url = EXCLUDED.repository_url, confidence = EXCLUDED.confidence`,
      [resumeAnalysisId, project.claim_id, project.title, project.description ?? null,
        project.role ?? null, project.domain ?? null, project.repository_url ?? null,
        project.confidence ?? null],
    );
  }
}

async function lookupTechnologies(
  client: PoolClient,
  normalizedNames: string[],
): Promise<Map<string, string>> {
  if (normalizedNames.length === 0) return new Map();
  const query = `SELECT name, id FROM technologies WHERE name = ANY($1)`;
  const result = await client.query<{ name: string; id: string }>(query, [normalizedNames]);
  return new Map(result.rows.map((r) => [r.name, r.id]));
}

async function insertResolvedTechnologies(
  client: PoolClient,
  jobApplicationId: string,
  technologyIds: string[],
): Promise<void> {
  const values = technologyIds.map((_, i) => `($1, $${i + 2}, 'RESOLVED')`).join(",");
  const params = [jobApplicationId, ...technologyIds];
  await client.query(
    `
    INSERT INTO application_technologies (job_application_id, technology_id, resolution_status)
    VALUES ${values}
    ON CONFLICT (job_application_id, technology_id) WHERE technology_id IS NOT NULL DO NOTHING
    `,
    params,
  );
}

async function insertUnresolvedTechnologies(
  client: PoolClient,
  jobApplicationId: string,
  unresolved: Array<{ raw: string; key: string }>,
): Promise<void> {
  if (unresolved.length === 0) return;
  const values = unresolved
    .map(
      (_, i) =>
        `($1, $${i * 2 + 2}, $${i * 2 + 3}, 'UNRESOLVED', 'NO_MATCH')`,
    )
    .join(",");
  const params: any[] = [jobApplicationId];
  for (const u of unresolved) params.push(u.raw, u.key);
  await client.query(
    `
    INSERT INTO application_technologies (job_application_id, raw_value, normalized_key, resolution_status, resolution_reason)
    VALUES ${values}
    ON CONFLICT (job_application_id, normalized_key) WHERE technology_id IS NULL DO NOTHING
    `,
    params,
  );
}


function normalizeConcept(raw: string): string {
  if (!raw) return "";
  return raw.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}

async function persistConcepts(
  client: PoolClient,
  jobApplicationId: string,
  concepts: Array<{ normalized_name?: string }>,
): Promise<void> {
  const conceptSet = new Set<string>();
  for (const c of concepts) {
    const raw = c.normalized_name || "";
    if (!raw.trim()) continue;
    const normalized = normalizeConcept(raw);
    if (normalized) conceptSet.add(normalized);
  }
  if (conceptSet.size === 0) return;
  const values = Array.from(conceptSet)
    .map((_, i) => `($1, $${i + 2})`)
    .join(",");
  const params = [jobApplicationId, ...conceptSet];
  await client.query(
    `
    INSERT INTO application_concepts (job_application_id, concept)
    VALUES ${values}
    ON CONFLICT (job_application_id, concept) DO NOTHING
    `,
    params,
  );
}


async function persistClaims(
  client: PoolClient,
  resumeAnalysisId: string,
  candidate: CandidateExtractionOutput,
): Promise<void> {
  const projectClaimIdMap = new Map<string, string>();
  for (const project of candidate.projects ?? []) {
    const projectRow = await client.query<{ id: string }>(
      `SELECT id FROM application_projects
       WHERE resume_analysis_id = $1 AND claim_id = $2`,
      [resumeAnalysisId, project.claim_id],
    );
    if (!projectRow.rows[0]) {
      throw new AppError("Project container was not persisted", 500);
    }
    await insertClaim(
      client,
      resumeAnalysisId,
      null,
      project.claim_id,
      "PROJECT_CONTAINER",
      project.title,
    );
    const parentProjectId = projectRow.rows[0].id;
    for (const claim of project.implementation_claims ?? []) {
      await insertClaim(client, resumeAnalysisId, parentProjectId, claim.claim_id, "IMPLEMENTATION", claim.text);
    }
    for (const claim of project.architectural_claims ?? []) {
      await insertClaim(client, resumeAnalysisId, parentProjectId, claim.claim_id, "ARCHITECTURAL", claim.text);
    }
    for (const claim of project.major_features ?? []) {
      await insertClaim(client, resumeAnalysisId, parentProjectId, claim.claim_id, "MAJOR_FEATURE", claim.text);
    }
  }
  for (const we of candidate.work_experience ?? []) {
    const claimText = `${we.role || ""} at ${we.company || ""}`.trim() || "Work experience";
    const dbId = await insertClaim(client, resumeAnalysisId, null, we.claim_id, "WORK_CONTAINER", claimText);
    for (const claim of we.responsibilities ?? []) {
      await insertClaim(client, resumeAnalysisId, dbId, claim.claim_id, "RESPONSIBILITY", claim.text);
    }
    for (const claim of we.achievements ?? []) {
      await insertClaim(client, resumeAnalysisId, dbId, claim.claim_id, "ACHIEVEMENT", claim.text);
    }
    for (const claim of we.implementation_claims ?? []) {
      await insertClaim(client, resumeAnalysisId, dbId, claim.claim_id, "IMPLEMENTATION", claim.text);
    }
  }
  if (candidate.candidate_profile?.summary_claim_id && candidate.candidate_profile?.summary) {
    await insertClaim(
      client,
      resumeAnalysisId,
      null,
      candidate.candidate_profile.summary_claim_id,
      "SUMMARY",
      candidate.candidate_profile.summary,
    );
  }
  for (const misc of candidate.miscellaneous_claims ?? []) {
    await insertClaim(client, resumeAnalysisId, null, misc.claim_id, "MISCELLANEOUS", misc.claim);
  }
}

async function insertClaim(
  client: PoolClient,
  resumeAnalysisId: string,
  parentProjectId: string | null,
  claimId: string,
  claimType: string,
  claimText: string,
): Promise<string> {
  const existing = await client.query<{ id: string }>(
    `SELECT id FROM application_claims
     WHERE resume_analysis_id = $1 AND claim_id = $2
     LIMIT 1`,
    [resumeAnalysisId, claimId],
  );
  if (existing.rows[0]) {
    await client.query(
      `UPDATE application_claims
       SET parent_project_id = $2, claim_type = $3, claim_text = $4
       WHERE id = $1`,
      [existing.rows[0].id, parentProjectId, claimType, claimText],
    );
    return existing.rows[0].id;
  }
  const result = await client.query<{ id: string }>(
    `INSERT INTO application_claims
      (resume_analysis_id, parent_project_id, claim_id, claim_type, claim_text)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [resumeAnalysisId, parentProjectId, claimId, claimType, claimText],
  );
  if (result.rowCount === 0 || !result.rows[0]) {
    throw new AppError("Failed to insert or update claim", 500);
  }
  return result.rows[0].id;
}


async function persistWorkExperiences(
  client: PoolClient,
  resumeAnalysisId: string,
  candidate: CandidateExtractionOutput,
): Promise<void> {
  const workExperiences = candidate.work_experience ?? [];
  if (workExperiences.length === 0) return;

 

  const values = workExperiences
    .map(
      (_, i) =>
        `($1, $${i * 10 + 2}, $${i * 10 + 3}, $${i * 10 + 4}, $${i * 10 + 5}, $${i * 10 + 6}, $${i * 10 + 7}, $${i * 10 + 8}, $${i * 10 + 9}, $${i * 10 + 10}, $${i * 10 + 11})`,
    )
    .join(",");

  const params: any[] = [resumeAnalysisId];
  for (const we of workExperiences) {
   
    let endDate = we.end_date ?? null;
    if (we.current && (endDate === null || endDate.toLowerCase() === "present")) {
      endDate = "Present";
    }
    params.push(
      we.claim_id,
      we.company ?? null,
      we.role ?? null,
      we.start_date ?? null,
      endDate,
      we.current ?? false,
      we.domains ?? [],
      we.context_flags ?? [],
      we.confidence ?? null,
    );
  }

  const query = `
    INSERT INTO application_work_experiences (
      resume_analysis_id,
      claim_id,
      company,
      role,
      start_date,
      end_date,
      current,
      domains,
      context_flags,
      confidence
    ) VALUES ${values}
    ON CONFLICT (resume_analysis_id, claim_id) DO UPDATE
    SET
      company = EXCLUDED.company,
      role = EXCLUDED.role,
      start_date = EXCLUDED.start_date,
      end_date = EXCLUDED.end_date,
      current = EXCLUDED.current,
      domains = EXCLUDED.domains,
      context_flags = EXCLUDED.context_flags,
      confidence = EXCLUDED.confidence
  `;

  await client.query(query, params);
}


async function persistProjects(
  client: PoolClient,
  resumeAnalysisId: string,
  candidate: CandidateExtractionOutput,
  evaluation: ResumeEvaluationReportLLMOutput,
): Promise<void> {
 
  const candidateProjectMap = new Map<string, any>();
  for (const p of candidate.projects ?? []) {
    candidateProjectMap.set(p.claim_id, p);
  }

  const prioritized = evaluation.project_analysis?.prioritized_projects ?? [];
  if (prioritized.length > 0) {
    const values = prioritized
      .map(
        (_, i) =>
          `($1, $${i * 15 + 2}, $${i * 15 + 3}, $${i * 15 + 4}, $${i * 15 + 5}, $${i * 15 + 6}, $${i * 15 + 7}, $${i * 15 + 8}, $${i * 15 + 9}, $${i * 15 + 10}, $${i * 15 + 11}, $${i * 15 + 12}, $${i * 15 + 13}, $${i * 15 + 14}, $${i * 15 + 15}, $${i * 15 + 16})`,
      )
      .join(",");

    const params: any[] = [resumeAnalysisId];
    for (const p of prioritized) {
      
      const candidateProj = candidateProjectMap.get(p.project_id);
      params.push(
        p.project_id,
        candidateProj?.title ?? null,
        candidateProj?.description ?? null,
        candidateProj?.role ?? null,
        candidateProj?.domain ?? null,
        candidateProj?.repository_url ?? null,
        p.relevance?.score ?? null,
        p.quality?.score ?? null,
        p.score ?? null,
        p.rating ?? null,
        p.priority ?? null,
        candidateProj?.confidence ?? null,
        p.summary ?? null,
        p.supporting_claim_ids ?? [],
        false, 
      );
    }

    const query = `
      INSERT INTO application_projects (
        resume_analysis_id,
        claim_id,
        title,
        description,
        role,
        domain,
        repository_url,
        relevance_score,
        quality_score,
        overall_score,
        rating,
        priority,
        confidence,
        summary,
        supporting_claim_ids,
        ignored
      ) VALUES ${values}
      ON CONFLICT (resume_analysis_id, claim_id) DO UPDATE
      SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        role = EXCLUDED.role,
        domain = EXCLUDED.domain,
        repository_url = EXCLUDED.repository_url,
        relevance_score = EXCLUDED.relevance_score,
        quality_score = EXCLUDED.quality_score,
        overall_score = EXCLUDED.overall_score,
        rating = EXCLUDED.rating,
        priority = EXCLUDED.priority,
        confidence = EXCLUDED.confidence,
        summary = EXCLUDED.summary,
        supporting_claim_ids = EXCLUDED.supporting_claim_ids,
        ignored = false
    `;

    await client.query(query, params);
  }


  const ignored = evaluation.project_analysis?.ignored_projects ?? [];
  if (ignored.length > 0) {
   
    const values = ignored
      .map(
        (_, i) =>
          `($1, $${i * 2 + 2}, $${i * 2 + 3}, true)`,
      )
      .join(",");

    const params: any[] = [resumeAnalysisId];
    for (const claimId of ignored) {
      const candidateProj = candidateProjectMap.get(claimId);
      
      const title = candidateProj?.title ?? claimId;
      params.push(claimId, title);
    }

    const query = `
      INSERT INTO application_projects (
        resume_analysis_id,
        claim_id,
        title,
        ignored
      ) VALUES ${values}
      ON CONFLICT (resume_analysis_id, claim_id) DO UPDATE
      SET
        ignored = true,
        title = EXCLUDED.title
    `;

    await client.query(query, params);
  }
}


async function persistRequirementResults(
  client: PoolClient,
  resumeAnalysisId: string,
  evaluation: ResumeEvaluationReportLLMOutput,
): Promise<void> {
  const reqAnalysis = evaluation.requirement_analysis ?? {};
  const tiers = ["mandatory", "preferred", "bonus"];
  const kinds = ["technologies", "concepts", "qualifications"];

  const rows: Array<{
    tier: string;
    type: string;
    name: string;
    status: string;
    note: string;
    supporting_claim_ids: string[];
  }> = [];

  for (const tier of tiers) {
  const tierBlock = (reqAnalysis as any)[tier] ?? {};
    for (const kind of kinds) {
      for (const item of tierBlock[kind] ?? []) {
        rows.push({
          tier,
          type: kind,
          name: item.name,
          status: item.status,
          note: item.note ?? "",
          supporting_claim_ids: item.supporting_claim_ids ?? [],
        });
      }
    }
  }

  if (rows.length === 0) return;

  const values = rows
    .map(
      (_, i) =>
        `($1, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6}, $${i * 6 + 7})`,
    )
    .join(",");

  const params: any[] = [resumeAnalysisId];
  for (const row of rows) {
    params.push(row.tier, row.type, row.name, row.status, row.note, row.supporting_claim_ids);
  }

  const query = `
    INSERT INTO application_requirement_results (
      resume_analysis_id,
      tier,
      requirement_type,
      requirement_name,
      status,
      note,
      supporting_claim_ids
    ) VALUES ${values}
    ON CONFLICT (resume_analysis_id, tier, requirement_type, requirement_name) DO UPDATE
    SET
      status = EXCLUDED.status,
      note = EXCLUDED.note,
      supporting_claim_ids = EXCLUDED.supporting_claim_ids
  `;

  await client.query(query, params);
}


async function persistBucketScores(
  client: PoolClient,
  resumeAnalysisId: string,
  evaluation: ResumeEvaluationReportLLMOutput,
): Promise<void> {
  const buckets = evaluation.bucket_scores ?? {};
  const entries = Object.entries(buckets);
  if (entries.length === 0) return;

  for (const [bucketName, bucket] of entries) {
    const values = [
      resumeAnalysisId,
      bucketName,
      bucket.score ?? null,
      bucket.rating ?? "UNDETERMINABLE",
      bucket.confidence ?? "LOW",
      bucket.summary ?? "",
      bucket.supporting_claim_ids ?? [],
    ];
    const existing = await client.query<{ id: string }>(
      `SELECT id FROM application_bucket_scores
       WHERE resume_analysis_id = $1 AND bucket_name = $2
       LIMIT 1`,
      [resumeAnalysisId, bucketName],
    );
    if (existing.rowCount && existing.rows[0]) {
      await client.query(
        `UPDATE application_bucket_scores
         SET score = $3, rating = $4, confidence = $5, summary = $6,
             supporting_claim_ids = $7
         WHERE id = $8`,
        [...values.slice(2), existing.rows[0].id],
      );
    } else {
      await client.query(
        `INSERT INTO application_bucket_scores
         (resume_analysis_id, bucket_name, score, rating, confidence, summary, supporting_claim_ids)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        values,
      );
    }
  }
}


async function persistScoreRationale(
  client: PoolClient,
  resumeAnalysisId: string,
  evaluation: ResumeEvaluationReportLLMOutput,
): Promise<void> {
  const rationale = evaluation.score_rationale ?? {};
  const driversUp = rationale.drivers_up ?? [];
  const driversDown = rationale.drivers_down ?? [];

  const allDrivers = [
    ...driversUp.map((d) => ({ ...d, direction: "up", impact: null })),
    ...driversDown.map((d) => ({ ...d, direction: "down", impact: d.impact ?? null })),
  ];

  if (allDrivers.length === 0) return;

  const values = allDrivers
    .map(
      (_, i) =>
        `($1, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4}, $${i * 4 + 5})`,
    )
    .join(",");

  const params: any[] = [resumeAnalysisId];
  for (const d of allDrivers) {
    params.push(d.direction, d.impact, d.reason, d.claim_ids ?? []);
  }

  const query = `
    INSERT INTO application_score_rationale (
      resume_analysis_id,
      direction,
      impact,
      reason,
      supporting_claim_ids
    ) VALUES ${values}
  `;

  await client.query(query, params);
}


async function persistVerificationTargets(
  client: PoolClient,
  resumeAnalysisId: string,
  evaluation: ResumeEvaluationReportLLMOutput,
): Promise<void> {
  const targets = evaluation.verification_plan?.verification_targets ?? [];
  if (targets.length === 0) return;

  
  const projectClaimIds = targets
    .map((t) => t.related_project_id)
    .filter((id): id is string => id !== undefined && id !== null);
  const claimIdToUuid = new Map<string, string>();
  if (projectClaimIds.length > 0) {
    const result = await client.query<{ claim_id: string; id: string }>(
      `SELECT claim_id, id FROM application_claims WHERE resume_analysis_id = $1 AND claim_id = ANY($2)`,
      [resumeAnalysisId, projectClaimIds],
    );
    for (const row of result.rows) {
      claimIdToUuid.set(row.claim_id, row.id);
    }
  }

  const values = targets
    .map(
      (_, i) =>
        `($1, $${i * 5 + 2}::text, $${i * 5 + 3}::uuid, $${i * 5 + 4}::text, $${i * 5 + 5}::text, $${i * 5 + 6}::text[])`,
    )
    .join(",");

  const params: any[] = [resumeAnalysisId];
  for (const t of targets) {
    const projectClaimUuid = t.related_project_id ? claimIdToUuid.get(t.related_project_id) || null : null;
    params.push(
      t.claim_id,
      projectClaimUuid,
      t.importance,
      t.claim_type,
      t.search_hints ?? [],
    );
  }

  const query = `
    INSERT INTO application_verification_targets (
      resume_analysis_id,
      claim_id,
      project_claim_id,
      importance,
      claim_type,
      search_hints
    ) VALUES ${values}
    ON CONFLICT (resume_analysis_id, claim_id) DO UPDATE
    SET
      project_claim_id = EXCLUDED.project_claim_id,
      importance = EXCLUDED.importance,
      claim_type = EXCLUDED.claim_type,
      search_hints = EXCLUDED.search_hints
  `;

  await client.query(query, params);
}
