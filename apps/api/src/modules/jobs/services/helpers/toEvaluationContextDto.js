"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toEvaluationContextDto = toEvaluationContextDto;
function toRequirementItem(row) {
    return {
        name: row.name,
        type: row.requirement_type,
        category: row.category,
        weight: Number(row.weight),
    };
}
function groupRequirementsByPriority(rows) {
    const buckets = {
        MANDATORY: [],
        PREFERRED: [],
        BONUS: [],
    };
    for (const row of rows) {
        buckets[row.priority_type].push(row);
    }
    return {
        mandatory: buckets.MANDATORY.map(toRequirementItem),
        preferred: buckets.PREFERRED.map(toRequirementItem),
        bonus: buckets.BONUS.map(toRequirementItem),
    };
}
function toRubricItem(row) {
    return {
        code: row.code,
        name: row.name,
        description: row.description,
        weight: row.weight,
        priority_type: row.priority_type
    };
}
function toEvaluationContextDto(job, requirements, evaluationPriorities, evidencePriorities, successSignals) {
    return {
        job: {
            title: job.title,
            department: job.department,
            description: job.description,
            roleCategory: job.role_category_code
                ? {
                    code: job.role_category_code,
                    name: job.role_category_name,
                    description: job.role_category_description,
                }
                : null,
        },
        qualifications: {
            experienceYearsMin: job.experience_min_years,
            experienceYearsMax: job.experience_max_years,
            minimumEducationLevel: job.minimum_education_level,
        },
        submissionRequirements: {
            resumeRequired: job.resume_required ?? false,
            githubRequired: job.github_required ?? false,
            linkedinRequired: job.linkedin_required ?? false,
            problemSolvingProfileRequired: job.problem_solving_profile_required ?? false,
            projectExplanationRequired: job.project_explanation_required ?? false,
            featureExplanationRequired: job.feature_explanation_required ?? false,
        },
        requirements: groupRequirementsByPriority(requirements),
        evaluationPriorities: evaluationPriorities.map(toRubricItem),
        evidencePriorities: evidencePriorities.map(toRubricItem),
        successSignals: successSignals.map(toRubricItem),
    };
}
//# sourceMappingURL=toEvaluationContextDto.js.map