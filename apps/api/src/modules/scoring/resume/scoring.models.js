"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBucketScore = getBucketScore;
exports.getRawSignals = getRawSignals;
exports.flattenRequirementItems = flattenRequirementItems;
exports.looksLikeSubstitution = looksLikeSubstitution;
exports.getClaimedYears = getClaimedYears;
exports.getHighestEducationLevel = getHighestEducationLevel;
function getBucketScore(evaluation, bucketName) {
    if (!evaluation)
        return null;
    const bucketScores = evaluation.bucket_scores;
    if (!bucketScores)
        return null;
    const bucket = bucketScores[bucketName];
    if (!bucket)
        return null;
    const score = bucket.score;
    if (score === undefined || score === null)
        return null;
    if (typeof score !== 'number')
        return null;
    return score;
}
function getRawSignals(evaluation) {
    if (!evaluation)
        return [];
    const bucket = evaluation.bucket_scores?.supporting_signals;
    if (!bucket)
        return [];
    return bucket.signals ?? [];
}
function flattenRequirementItems(evaluation) {
    const items = [];
    if (!evaluation)
        return items;
    const reqAnalysis = evaluation.requirement_analysis ?? {};
    for (const tier of ['mandatory', 'preferred', 'bonus']) {
        const tierBlock = reqAnalysis[tier] ?? {};
        for (const kind of ['technologies', 'concepts', 'qualifications']) {
            const entries = tierBlock[kind] ?? [];
            for (const entry of entries) {
                items.push({
                    tier,
                    kind,
                    name: entry.name ?? 'unknown',
                    status: entry.status ?? 'UNKNOWN',
                    note: entry.note ?? '',
                });
            }
        }
    }
    return items;
}
function looksLikeSubstitution(note) {
    if (!note)
        return false;
    const lowered = note.toLowerCase();
    return ['substitut', 'adjacent', 'comparable', 'offset'].some((kw) => lowered.includes(kw));
}
function getClaimedYears(candidate) {
    if (!candidate)
        return null;
    const yoe = candidate.candidate_profile?.claimed_total_experience_years;
    if (yoe === undefined || yoe === null)
        return null;
    if (typeof yoe !== 'number')
        return null;
    return yoe;
}
function getHighestEducationLevel(candidate) {
    if (!candidate)
        return 0;
    const degreeLevelMap = {
        'b.e.': 1,
        'b.tech': 1,
        bachelor: 1,
        bsc: 1,
        'b.a.': 1,
        be: 1,
        'm.e.': 2,
        'm.tech': 2,
        master: 2,
        msc: 2,
        mba: 2,
        phd: 3,
        doctorate: 3,
        dphil: 3,
    };
    let highest = 0;
    for (const edu of candidate.education ?? []) {
        const degree = edu.degree?.toLowerCase().trim() ?? '';
        for (const [key, level] of Object.entries(degreeLevelMap)) {
            if (degree.includes(key) && level > highest) {
                highest = level;
                break;
            }
        }
    }
    return highest;
}
//# sourceMappingURL=scoring.models.js.map