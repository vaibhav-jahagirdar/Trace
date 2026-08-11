"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeResumeScores = computeResumeScores;
const scoring_constants_1 = require("./scoring.constants");
const scoring_models_1 = require("./scoring.models");
function computeDepthScale(jobContext) {
    const notes = [];
    const priorities = jobContext?.evaluationPriorities ?? [];
    let mappedWeight = 0;
    let totalWeight = 0;
    for (const p of priorities) {
        const code = p.code;
        const weight = Number(p.weight ?? 0);
        totalWeight += weight;
        if (scoring_constants_1.EVALUATION_PRIORITY_BUCKET_MAP[code]) {
            mappedWeight += weight;
        }
        else {
            notes.push(`evaluationPriority '${code}' (weight ${weight}) has no bucket mapping; excluded from Layer 1`);
        }
    }
    if (totalWeight <= 0) {
        return { scale: 1.0, notes };
    }
    const technicalDepthShare = mappedWeight / totalWeight;
    const scale = scoring_constants_1.DEPTH_SCALE_MIN + scoring_constants_1.DEPTH_SCALE_RANGE * technicalDepthShare;
    notes.push(`technical-depth scale: ${scale.toFixed(3)} (share ${technicalDepthShare.toFixed(2)})`);
    return { scale, notes };
}
function computeSupportingSignalsScore(evaluation, jobContext) {
    const notes = [];
    const configuredSignals = {};
    for (const s of jobContext?.successSignals ?? []) {
        configuredSignals[s.code] = Number(s.weight ?? 0);
    }
    const rawSignals = (0, scoring_models_1.getRawSignals)(evaluation);
    if (Object.keys(configuredSignals).length === 0) {
        return { score: (0, scoring_models_1.getBucketScore)(evaluation, 'supporting_signals'), notes };
    }
    let weightedSum = 0;
    let weightUsed = 0;
    for (const sig of rawSignals) {
        const code = sig.code;
        if (!configuredSignals[code])
            continue;
        const score = sig.score;
        const w = configuredSignals[code];
        if (score === undefined || score === null) {
            notes.push(`successSignal '${code}' UNDETERMINABLE – excluded`);
            continue;
        }
        weightedSum += Number(score) * w;
        weightUsed += w;
    }
    if (weightUsed <= 0) {
        notes.push('No determinable success signals – supporting_signals excluded from Layer 1');
        return { score: null, notes };
    }
    return { score: weightedSum / weightUsed, notes };
}
function computeLayer1Score(evaluation, jobContext) {
    const notes = [];
    const { scale, notes: depthNotes } = computeDepthScale(jobContext);
    notes.push(...depthNotes);
    const weights = { ...scoring_constants_1.BASE_BUCKET_WEIGHTS };
    for (const bucket of scoring_constants_1.EVALUATION_PRIORITY_BUCKET_MAP.TECHNICAL_DEPTH ?? []) {
        if (weights[bucket] !== undefined) {
            weights[bucket] *= scale;
        }
    }
    const scores = {};
    for (const bucketName of Object.keys(weights)) {
        if (bucketName === 'supporting_signals') {
            const { score, notes: sigNotes } = computeSupportingSignalsScore(evaluation, jobContext);
            scores[bucketName] = score;
            notes.push(...sigNotes);
        }
        else {
            scores[bucketName] = (0, scoring_models_1.getBucketScore)(evaluation, bucketName);
        }
    }
    const totalWeightAvailable = Object.entries(weights)
        .filter(([name]) => scores[name] !== null)
        .reduce((sum, [, w]) => sum + w, 0);
    const contributions = [];
    if (totalWeightAvailable <= 0) {
        notes.push('All buckets UNDETERMINABLE – quarantine required');
        return { score: null, contributions, notes };
    }
    let weightedSum = 0;
    for (const [bucketName, weight] of Object.entries(weights)) {
        const rawScore = scores[bucketName];
        if (rawScore === null || rawScore === undefined) {
            contributions.push({
                bucket: bucketName,
                raw_score: null,
                weight_applied: 0,
                weighted_contribution: 0,
                excluded_reason: 'UNDETERMINABLE – excluded, weight renormalised away',
            });
            continue;
        }
        const normalizedWeight = (weight / totalWeightAvailable) * 100;
        const contribution = (rawScore * normalizedWeight) / 100;
        weightedSum += contribution;
        contributions.push({
            bucket: bucketName,
            raw_score: rawScore,
            weight_applied: Math.round(normalizedWeight * 100) / 100,
            weighted_contribution: Math.round(contribution * 100) / 100,
        });
    }
    return { score: Math.round(weightedSum * 100) / 100, contributions, notes };
}
function roleFitGate(evaluation) {
    const band = evaluation?.overall?.overall_role_fit;
    const ceiling = band ? scoring_constants_1.ROLE_FIT_CEILING[band] : undefined;
    if (ceiling === undefined) {
        throw new Error(`QUARANTINE: overall_role_fit missing or unrecognized: ${band}`);
    }
    return {
        name: 'overall_role_fit_ceiling',
        applied: true,
        ceiling,
        reason: `overall_role_fit=${band} caps score at ${ceiling}`,
    };
}
function mandatoryGapGate(evaluation) {
    const items = (0, scoring_models_1.flattenRequirementItems)(evaluation);
    for (const item of items) {
        if (item.tier !== 'mandatory')
            continue;
        if (item.status === 'CONFIRMED')
            continue;
        if (item.status === 'UNCONFIRMED' && (0, scoring_models_1.looksLikeSubstitution)(item.note))
            continue;
        return {
            name: 'mandatory_gap_ceiling',
            applied: true,
            ceiling: scoring_constants_1.MANDATORY_GAP_CEILING,
            reason: `Mandatory ${item.kind.slice(0, -3)} '${item.name}' is ${item.status} – no documented substitution`,
        };
    }
    return {
        name: 'mandatory_gap_ceiling',
        applied: false,
        ceiling: null,
        reason: 'All mandatory items confirmed or validly substituted',
    };
}
function strictTechnologyModeCheck(jobContext, evaluation) {
    if (!jobContext?.strictTechnologyMode)
        return null;
    const items = (0, scoring_models_1.flattenRequirementItems)(evaluation);
    for (const item of items) {
        if (item.tier === 'mandatory' && item.kind === 'technologies' && item.status !== 'CONFIRMED') {
            return `strictTechnologyMode: mandatory technology '${item.name}' is ${item.status}`;
        }
    }
    return null;
}
function educationGate(jobContext, candidate) {
    const notes = [];
    const minLevelStr = jobContext?.qualifications?.minimumEducationLevel;
    if (!minLevelStr)
        return { penalty: 0, notes };
    const educationLevelOrder = {
        HIGH_SCHOOL: 0,
        UNDERGRADUATE: 1,
        BACHELORS: 1,
        GRADUATE: 2,
        MASTERS: 2,
        DOCTORATE: 3,
        PHD: 3,
    };
    const minLevel = educationLevelOrder[minLevelStr.toUpperCase()];
    if (minLevel === undefined) {
        notes.push(`Unrecognized minimumEducationLevel '${minLevelStr}' – education gate skipped`);
        return { penalty: 0, notes };
    }
    const highestLevel = (0, scoring_models_1.getHighestEducationLevel)(candidate);
    if (highestLevel < minLevel) {
        notes.push(`Highest degree (${highestLevel}) below required minimum (${minLevel}) – soft penalty applied`);
        return { penalty: scoring_constants_1.EDUCATION_GAP_SOFT_PENALTY, notes };
    }
    return { penalty: 0, notes };
}
function experienceGate(jobContext, candidate) {
    const notes = [];
    const quals = jobContext?.qualifications ?? {};
    const minYoe = quals.experienceYearsMin;
    const maxYoe = quals.experienceYearsMax;
    if (minYoe === undefined && maxYoe === undefined) {
        return { penalty: 0, notes };
    }
    const claimed = (0, scoring_models_1.getClaimedYears)(candidate);
    if (claimed === null) {
        notes.push('claimed_total_experience_years omitted – small soft penalty');
        return { penalty: scoring_constants_1.EXPERIENCE_UNKNOWN_PENALTY, notes };
    }
    const min = minYoe ?? 0;
    const max = maxYoe ?? Number.MAX_SAFE_INTEGER;
    if (claimed < min || claimed > max) {
        notes.push(`claimed ${claimed} years outside range [${min}, ${max}] – soft penalty`);
        return { penalty: scoring_constants_1.EXPERIENCE_GAP_SOFT_PENALTY, notes };
    }
    return { penalty: 0, notes };
}
function computeResumeScores(jobContext, llmOutput, candidateRef = '') {
    const candidate = llmOutput?.candidate ?? {};
    const evaluation = llmOutput?.evaluation ?? {};
    const auditNotes = [];
    const disqualifyReason = strictTechnologyModeCheck(jobContext, evaluation);
    if (disqualifyReason) {
        return {
            candidate_ref: candidateRef,
            status: 'DISQUALIFIED',
            resume_match_score: null,
            layer1_continuous_score: null,
            bucket_contributions: [],
            gates: [],
            stage2_priority_hints: {},
            audit_notes: [disqualifyReason],
            overall_role_fit: evaluation?.overall?.overall_role_fit ?? null,
            repository_priority: evaluation?.overall?.repository_priority ?? null,
        };
    }
    let roleGate;
    try {
        roleGate = roleFitGate(evaluation);
    }
    catch (err) {
        return {
            candidate_ref: candidateRef,
            status: 'QUARANTINED',
            resume_match_score: null,
            layer1_continuous_score: null,
            bucket_contributions: [],
            gates: [],
            stage2_priority_hints: {},
            audit_notes: [`QUARANTINED: ${err instanceof Error ? err.message : String(err)}`],
        };
    }
    const { score: layer1Score, contributions, notes: layer1Notes } = computeLayer1Score(evaluation, jobContext);
    auditNotes.push(...layer1Notes);
    if (layer1Score === null) {
        return {
            candidate_ref: candidateRef,
            status: 'QUARANTINED',
            resume_match_score: null,
            layer1_continuous_score: null,
            bucket_contributions: contributions,
            gates: [roleGate],
            stage2_priority_hints: {},
            audit_notes: [...auditNotes, 'QUARANTINED: no scorable bucket evidence'],
        };
    }
    const gapGate = mandatoryGapGate(evaluation);
    const gates = [roleGate, gapGate];
    const ceilings = gates.filter((g) => g.applied && g.ceiling !== null).map((g) => g.ceiling);
    const scoreAfterCeilings = ceilings.length > 0 ? Math.min(layer1Score, ...ceilings) : layer1Score;
    const eduPenalty = educationGate(jobContext, candidate);
    const expPenalty = experienceGate(jobContext, candidate);
    auditNotes.push(...eduPenalty.notes);
    auditNotes.push(...expPenalty.notes);
    const finalScore = Math.max(0, Math.min(100, scoreAfterCeilings - eduPenalty.penalty - expPenalty.penalty));
    const stage2Hints = {};
    for (const p of jobContext?.evidencePriorities ?? []) {
        stage2Hints[p.code] = Number(p.weight ?? 0);
    }
    return {
        candidate_ref: candidateRef,
        status: 'SCORED',
        resume_match_score: Math.round(finalScore * 100) / 100,
        layer1_continuous_score: layer1Score,
        bucket_contributions: contributions,
        gates,
        stage2_priority_hints: stage2Hints,
        audit_notes: auditNotes,
        overall_role_fit: evaluation?.overall?.overall_role_fit ?? null,
        repository_priority: evaluation?.overall?.repository_priority ?? null,
    };
}
//# sourceMappingURL=scoring.service.js.map