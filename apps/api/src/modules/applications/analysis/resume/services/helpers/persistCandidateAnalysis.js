"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.persistCandidateAnalysis = persistCandidateAnalysis;
const normalizeTech_1 = require("./normalizeTech");
const errorHandler_1 = require("../../../../../../middleware/errorHandler");
async function persistCandidateAnalysis(client, resumeAnalysisId, jobApplicationId, candidate, evaluation) {
    const technologies = candidate.technologies ?? [];
    if (technologies.length > 0) {
        const normalizedToRaw = new Map();
        for (const tech of technologies) {
            const raw = tech.normalized_name || "";
            if (!raw.trim())
                continue;
            const key = (0, normalizeTech_1.normalizeTechnology)(raw.toLowerCase());
            if (!normalizedToRaw.has(key))
                normalizedToRaw.set(key, raw);
        }
        const normalizedKeys = Array.from(normalizedToRaw.keys());
        if (normalizedKeys.length > 0) {
            const lookupMap = await lookupTechnologies(client, normalizedKeys);
            const resolvedIds = [];
            const unresolved = [];
            for (const [key, raw] of normalizedToRaw.entries()) {
                const id = lookupMap.get(key);
                if (id)
                    resolvedIds.push(id);
                else
                    unresolved.push({ raw, key });
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
    await persistClaims(client, resumeAnalysisId, candidate);
    await persistWorkExperiences(client, resumeAnalysisId, candidate);
    await persistProjects(client, resumeAnalysisId, candidate, evaluation);
    await persistRequirementResults(client, resumeAnalysisId, evaluation);
    await persistBucketScores(client, resumeAnalysisId, evaluation);
    await persistScoreRationale(client, resumeAnalysisId, evaluation);
    await persistVerificationTargets(client, resumeAnalysisId, evaluation);
}
async function lookupTechnologies(client, normalizedNames) {
    if (normalizedNames.length === 0)
        return new Map();
    const query = `SELECT name, id FROM technologies WHERE name = ANY($1)`;
    const result = await client.query(query, [normalizedNames]);
    return new Map(result.rows.map((r) => [r.name, r.id]));
}
async function insertResolvedTechnologies(client, jobApplicationId, technologyIds) {
    const values = technologyIds.map((_, i) => `($1, $${i + 2}, 'RESOLVED')`).join(",");
    const params = [jobApplicationId, ...technologyIds];
    await client.query(`
    INSERT INTO application_technologies (job_application_id, technology_id, resolution_status)
    VALUES ${values}
    ON CONFLICT (job_application_id, technology_id) WHERE technology_id IS NOT NULL DO NOTHING
    `, params);
}
async function insertUnresolvedTechnologies(client, jobApplicationId, unresolved) {
    if (unresolved.length === 0)
        return;
    const values = unresolved
        .map((_, i) => `($1, $${i * 2 + 2}, $${i * 2 + 3}, 'UNRESOLVED', 'NO_MATCH')`)
        .join(",");
    const params = [jobApplicationId];
    for (const u of unresolved)
        params.push(u.raw, u.key);
    await client.query(`
    INSERT INTO application_technologies (job_application_id, raw_value, normalized_key, resolution_status, resolution_reason)
    VALUES ${values}
    ON CONFLICT (job_application_id, normalized_key) WHERE technology_id IS NULL DO NOTHING
    `, params);
}
function normalizeConcept(raw) {
    if (!raw)
        return "";
    return raw.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}
async function persistConcepts(client, jobApplicationId, concepts) {
    const conceptSet = new Set();
    for (const c of concepts) {
        const raw = c.normalized_name || "";
        if (!raw.trim())
            continue;
        const normalized = normalizeConcept(raw);
        if (normalized)
            conceptSet.add(normalized);
    }
    if (conceptSet.size === 0)
        return;
    const values = Array.from(conceptSet)
        .map((_, i) => `($1, $${i + 2})`)
        .join(",");
    const params = [jobApplicationId, ...conceptSet];
    await client.query(`
    INSERT INTO application_concepts (job_application_id, concept)
    VALUES ${values}
    ON CONFLICT (job_application_id, concept) DO NOTHING
    `, params);
}
async function persistClaims(client, resumeAnalysisId, candidate) {
    const projectClaimIdMap = new Map();
    for (const project of candidate.projects ?? []) {
        const dbId = await insertClaim(client, resumeAnalysisId, null, project.claim_id, "PROJECT_CONTAINER", project.title);
        projectClaimIdMap.set(project.claim_id, dbId);
        for (const claim of project.implementation_claims ?? []) {
            await insertClaim(client, resumeAnalysisId, dbId, claim.claim_id, "IMPLEMENTATION", claim.text);
        }
        for (const claim of project.architectural_claims ?? []) {
            await insertClaim(client, resumeAnalysisId, dbId, claim.claim_id, "ARCHITECTURAL", claim.text);
        }
        for (const claim of project.major_features ?? []) {
            await insertClaim(client, resumeAnalysisId, dbId, claim.claim_id, "MAJOR_FEATURE", claim.text);
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
        await insertClaim(client, resumeAnalysisId, null, candidate.candidate_profile.summary_claim_id, "SUMMARY", candidate.candidate_profile.summary);
    }
    for (const misc of candidate.miscellaneous_claims ?? []) {
        await insertClaim(client, resumeAnalysisId, null, misc.claim_id, "MISCELLANEOUS", misc.claim);
    }
}
async function insertClaim(client, resumeAnalysisId, parentProjectId, claimId, claimType, claimText) {
    const query = `
    INSERT INTO application_claims (
      resume_analysis_id,
      parent_project_id,
      claim_id,
      claim_type,
      claim_text
    ) VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (resume_analysis_id, claim_id) DO UPDATE
    SET
      parent_project_id = EXCLUDED.parent_project_id,
      claim_type = EXCLUDED.claim_type,
      claim_text = EXCLUDED.claim_text
    RETURNING id
  `;
    const result = await client.query(query, [
        resumeAnalysisId,
        parentProjectId,
        claimId,
        claimType,
        claimText,
    ]);
    if (result.rowCount === 0 || !result.rows[0]) {
        throw new errorHandler_1.AppError("Failed to insert or update claim", 500);
    }
    return result.rows[0].id;
}
async function persistWorkExperiences(client, resumeAnalysisId, candidate) {
    const workExperiences = candidate.work_experience ?? [];
    if (workExperiences.length === 0)
        return;
    const values = workExperiences
        .map((_, i) => `($1, $${i * 10 + 2}, $${i * 10 + 3}, $${i * 10 + 4}, $${i * 10 + 5}, $${i * 10 + 6}, $${i * 10 + 7}, $${i * 10 + 8}, $${i * 10 + 9}, $${i * 10 + 10}, $${i * 10 + 11})`)
        .join(",");
    const params = [resumeAnalysisId];
    for (const we of workExperiences) {
        let endDate = we.end_date ?? null;
        if (we.current && (endDate === null || endDate.toLowerCase() === "present")) {
            endDate = "Present";
        }
        params.push(we.claim_id, we.company ?? null, we.role ?? null, we.start_date ?? null, endDate, we.current ?? false, we.domains ?? [], we.context_flags ?? [], we.confidence ?? null);
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
async function persistProjects(client, resumeAnalysisId, candidate, evaluation) {
    const candidateProjectMap = new Map();
    for (const p of candidate.projects ?? []) {
        candidateProjectMap.set(p.claim_id, p);
    }
    const prioritized = evaluation.project_analysis?.prioritized_projects ?? [];
    if (prioritized.length > 0) {
        const values = prioritized
            .map((_, i) => `($1, $${i * 14 + 2}, $${i * 14 + 3}, $${i * 14 + 4}, $${i * 14 + 5}, $${i * 14 + 6}, $${i * 14 + 7}, $${i * 14 + 8}, $${i * 14 + 9}, $${i * 14 + 10}, $${i * 14 + 11}, $${i * 14 + 12}, $${i * 14 + 13}, $${i * 14 + 14}, $${i * 14 + 15})`)
            .join(",");
        const params = [resumeAnalysisId];
        for (const p of prioritized) {
            const candidateProj = candidateProjectMap.get(p.project_id);
            params.push(p.project_id, candidateProj?.title ?? null, candidateProj?.description ?? null, candidateProj?.role ?? null, candidateProj?.domain ?? null, candidateProj?.repository_url ?? null, p.relevance?.score ?? null, p.quality?.score ?? null, p.score ?? null, p.rating ?? null, p.priority ?? null, candidateProj?.confidence ?? null, p.summary ?? null, p.supporting_claim_ids ?? [], false);
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
            .map((_, i) => `($1, $${i * 2 + 2}, $${i * 2 + 3}, true)`)
            .join(",");
        const params = [resumeAnalysisId];
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
async function persistRequirementResults(client, resumeAnalysisId, evaluation) {
    const reqAnalysis = evaluation.requirement_analysis ?? {};
    const tiers = ["mandatory", "preferred", "bonus"];
    const kinds = ["technologies", "concepts", "qualifications"];
    const rows = [];
    for (const tier of tiers) {
        const tierBlock = reqAnalysis[tier] ?? {};
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
    if (rows.length === 0)
        return;
    const values = rows
        .map((_, i) => `($1, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6}, $${i * 6 + 7})`)
        .join(",");
    const params = [resumeAnalysisId];
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
async function persistBucketScores(client, resumeAnalysisId, evaluation) {
    const buckets = evaluation.bucket_scores ?? {};
    const entries = Object.entries(buckets);
    if (entries.length === 0)
        return;
    const values = entries
        .map((_, i) => `($1, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6}, $${i * 6 + 7})`)
        .join(",");
    const params = [resumeAnalysisId];
    for (const [bucketName, bucket] of entries) {
        params.push(bucketName, bucket.score ?? null, bucket.rating ?? "UNDETERMINABLE", bucket.confidence ?? "LOW", bucket.summary ?? "", bucket.supporting_claim_ids ?? []);
    }
    const query = `
    INSERT INTO application_bucket_scores (
      resume_analysis_id,
      bucket_name,
      score,
      rating,
      confidence,
      summary,
      supporting_claim_ids
    ) VALUES ${values}
    ON CONFLICT (resume_analysis_id, bucket_name) DO UPDATE
    SET
      score = EXCLUDED.score,
      rating = EXCLUDED.rating,
      confidence = EXCLUDED.confidence,
      summary = EXCLUDED.summary,
      supporting_claim_ids = EXCLUDED.supporting_claim_ids
  `;
    await client.query(query, params);
}
async function persistScoreRationale(client, resumeAnalysisId, evaluation) {
    const rationale = evaluation.score_rationale ?? {};
    const driversUp = rationale.drivers_up ?? [];
    const driversDown = rationale.drivers_down ?? [];
    const allDrivers = [
        ...driversUp.map((d) => ({ ...d, direction: "up", impact: null })),
        ...driversDown.map((d) => ({ ...d, direction: "down", impact: d.impact ?? null })),
    ];
    if (allDrivers.length === 0)
        return;
    const values = allDrivers
        .map((_, i) => `($1, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`)
        .join(",");
    const params = [resumeAnalysisId];
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
async function persistVerificationTargets(client, resumeAnalysisId, evaluation) {
    const targets = evaluation.verification_plan?.verification_targets ?? [];
    if (targets.length === 0)
        return;
    const projectClaimIds = targets
        .map((t) => t.related_project_id)
        .filter((id) => id !== undefined && id !== null);
    const claimIdToUuid = new Map();
    if (projectClaimIds.length > 0) {
        const result = await client.query(`SELECT claim_id, id FROM application_claims WHERE resume_analysis_id = $1 AND claim_id = ANY($2)`, [resumeAnalysisId, projectClaimIds]);
        for (const row of result.rows) {
            claimIdToUuid.set(row.claim_id, row.id);
        }
    }
    const values = targets
        .map((_, i) => `($1, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`)
        .join(",");
    const params = [resumeAnalysisId];
    for (const t of targets) {
        const projectClaimUuid = t.related_project_id ? claimIdToUuid.get(t.related_project_id) || null : null;
        params.push(t.claim_id, projectClaimUuid, t.importance, t.claim_type, t.search_hints ?? []);
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
//# sourceMappingURL=persistCandidateAnalysis.js.map