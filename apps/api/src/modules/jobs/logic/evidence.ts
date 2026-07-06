import { EvaluationWeightPolicy } from "../constants/scoring";
import { JobRole } from "../constants/jobPolicy";
import { JOB_ROLE_POLICY } from "../constants/scoring";
import { ValidationError } from "../../../middleware/errorHandler";
import type { JobEvidencePrioritiesInput } from "../jobs.validator";
import { EVALUATION_WEIGHT_POLICY } from "../constants/scoring";


export async function processEvidencePriorities (
    role: JobRole,
    evidencePriorities: JobEvidencePrioritiesInput,
) {
    const totalWeight = EVALUATION_WEIGHT_POLICY.REQUIRED_TOTAL;
    let currentWeightSum = 0; 

    if (evidencePriorities.length === 0)  {
        throw new ValidationError("At least one evidence priority must be provided.")
    }

    const evaluationPolicy = JOB_ROLE_POLICY[role];
    const minDimensions = evaluationPolicy.minDimensions;
    const maxDimensions = evaluationPolicy.maxDimensions;

    const minWeight = EVALUATION_WEIGHT_POLICY.MIN_WEIGHT;
    const maxWeight = EVALUATION_WEIGHT_POLICY.MAX_WEIGHT;

    if (evidencePriorities.length < minDimensions || evidencePriorities.length > maxDimensions) {
        throw new ValidationError(`The number of evidence priorities must be between ${minDimensions} and ${maxDimensions} for role ${role}.`);
    }
    const evidenceIds = new Set<string>();

    for (const priority of evidencePriorities) {
        if (evidenceIds.has(priority.evidence_category_id)) {
            throw new ValidationError(`Duplicate evidence category id ${priority.evidence_category_id} found.`);
        }
        evidenceIds.add(priority.evidence_category_id);
        if (priority.weight < minWeight || priority.weight > maxWeight) {
            throw new ValidationError(`Weight for evidence category id ${priority.evidence_category_id} must be between ${minWeight} and ${maxWeight}.`);
        }
        currentWeightSum += priority.weight;


    } if (currentWeightSum !== totalWeight) {
        throw new ValidationError(`The sum of weights for all evidence priorities must equal ${totalWeight}. Current sum is ${currentWeightSum}.`);
    }
    
    return evidencePriorities;


}