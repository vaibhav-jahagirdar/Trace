"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRole = getRole;
exports.processJobRequirements = processJobRequirements;
const db_1 = require("../../../config/db");
const jobPolicy_1 = require("../constants/jobPolicy");
const jobPolicy_2 = require("../constants/jobPolicy");
const errorHandler_1 = require("../../../middleware/errorHandler");
const pool = (0, db_1.getDb)();
async function getRole(roleCategoryId, client) {
    const result = await client.query(`
      SELECT code
      FROM job_role_categories
      WHERE id = $1
    `, [roleCategoryId]);
    if (result.rowCount === 0) {
        throw new errorHandler_1.NotFoundError(`Role category ${roleCategoryId} not found`);
    }
    return result.rows[0].code;
}
function processJobRequirements(role, requirements) {
    if (requirements.length === 0) {
        throw new errorHandler_1.ValidationError("At least one requirement must be provided.");
    }
    const roleLimits = jobPolicy_1.JOB_ROLE_POLICY[role].requirements;
    let mandatoryCount = 0;
    let preferredCount = 0;
    let bonusCount = 0;
    const technologyIds = new Set();
    const conceptIds = new Set();
    for (const requirement of requirements) {
        switch (requirement.priority_type) {
            case "MANDATORY":
                mandatoryCount++;
                break;
            case "PREFERRED":
                preferredCount++;
                break;
            case "BONUS":
                bonusCount++;
                break;
        }
        if (requirement.requirement_type === "TECHNOLOGY") {
            if (technologyIds.has(requirement.technology_id)) {
                throw new errorHandler_1.ValidationError("Duplicate technology requirements are not allowed.");
            }
            technologyIds.add(requirement.technology_id);
        }
        if (requirement.requirement_type === "CONCEPT") {
            if (conceptIds.has(requirement.concept_id)) {
                throw new errorHandler_1.ValidationError("Duplicate concept requirements are not allowed.");
            }
            conceptIds.add(requirement.concept_id);
        }
    }
    if (preferredCount === 0) {
        throw new errorHandler_1.ValidationError("At least one preferred requirement is required.");
    }
    if (mandatoryCount > roleLimits.mandatory) {
        throw new errorHandler_1.ValidationError(`Maximum ${roleLimits.mandatory} mandatory requirements are allowed for ${role}.`);
    }
    if (mandatoryCount > 0) {
        if (preferredCount > roleLimits.preferred) {
            throw new errorHandler_1.ValidationError(`Maximum ${roleLimits.preferred} preferred requirements are allowed for ${role}.`);
        }
    }
    else {
        if (preferredCount >
            roleLimits.preferredWithoutMandatory) {
            throw new errorHandler_1.ValidationError(`Maximum ${roleLimits.preferredWithoutMandatory} preferred requirements are allowed when no mandatory requirements are selected.`);
        }
    }
    if (bonusCount > roleLimits.bonus) {
        throw new errorHandler_1.ValidationError(`Maximum ${roleLimits.bonus} bonus requirements are allowed for ${role}.`);
    }
    let bucket;
    if (mandatoryCount > 0 && bonusCount > 0) {
        bucket = jobPolicy_2.REQUIREMENT_BUCKETS.WITH_MANDATORY;
    }
    else if (mandatoryCount > 0 && bonusCount === 0) {
        bucket = jobPolicy_2.REQUIREMENT_BUCKETS.WITHOUT_BONUS;
    }
    else if (mandatoryCount === 0 && bonusCount > 0) {
        bucket = jobPolicy_2.REQUIREMENT_BUCKETS.WITHOUT_MANDATORY;
    }
    else {
        bucket = jobPolicy_2.REQUIREMENT_BUCKETS.ONLY_PREFERRED;
    }
    const mandatoryWeight = mandatoryCount > 0
        ? bucket.MANDATORY / mandatoryCount
        : 0;
    const preferredWeight = preferredCount > 0
        ? bucket.PREFERRED / preferredCount
        : 0;
    const bonusWeight = bonusCount > 0
        ? bucket.BONUS / bonusCount
        : 0;
    return requirements.map((requirement) => {
        switch (requirement.priority_type) {
            case "MANDATORY":
                return {
                    ...requirement,
                    weight: mandatoryWeight,
                };
            case "PREFERRED":
                return {
                    ...requirement,
                    weight: preferredWeight,
                };
            case "BONUS":
                return {
                    ...requirement,
                    weight: bonusWeight,
                };
            default:
                throw new errorHandler_1.ValidationError("Invalid requirement priority.");
        }
    });
}
//# sourceMappingURL=requirements.js.map