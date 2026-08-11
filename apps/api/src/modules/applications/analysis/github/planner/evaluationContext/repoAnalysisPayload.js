"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryPlannerContextError = void 0;
exports.getRepositoryPlannerPayload = getRepositoryPlannerPayload;
const db_1 = require("../../../../../../config/db");
const evaluationContext_1 = require("../../../../../jobs/services/[jobId]/evaluationContext");
const applicationContext_service_1 = require("../../../../[applicationId]/services/applicationContext.service");
class RepositoryPlannerContextError extends Error {
    constructor(message) {
        super(message);
        this.name = "RepositoryPlannerContextError";
    }
}
exports.RepositoryPlannerContextError = RepositoryPlannerContextError;
async function getGithubUrl(jobApplicationId) {
    const { rows } = await (0, db_1.getDb)().query(`SELECT github_url
     FROM application_submissions
     WHERE job_application_id = $1`, [jobApplicationId]);
    const githubUrl = rows[0]?.github_url;
    if (!githubUrl) {
        throw new RepositoryPlannerContextError(`No github_url found for job_application_id=${jobApplicationId}`);
    }
    return githubUrl;
}
async function getStage1Report(jobApplicationId) {
    const { rows } = await (0, db_1.getDb)().query(`SELECT rar.cleaned_response
     FROM resume_analysis_results rar
     JOIN application_tasks at ON at.id = rar.application_task_id
     WHERE at.job_application_id = $1
     ORDER BY rar.created_at DESC
     LIMIT 1`, [jobApplicationId]);
    const stage1 = rows[0]?.cleaned_response;
    if (!stage1) {
        throw new RepositoryPlannerContextError(`No Stage 1 resume analysis found for job_application_id=${jobApplicationId}. ` +
            `Stage 1 must complete before Stage 2A can run.`);
    }
    return stage1;
}
async function getRepositoryPlannerPayload(applicationId, jobId, taskId) {
    const [jobContext, candidateContext, githubUrl, stage1] = await Promise.all([
        (0, evaluationContext_1.getEvaluationContext)(jobId),
        (0, applicationContext_service_1.getApplicationContext)(applicationId),
        getGithubUrl(applicationId),
        getStage1Report(taskId),
    ]);
    return {
        job_context: jobContext,
        candidate_context: candidateContext,
        stage_1: stage1,
        github_url: githubUrl,
    };
}
//# sourceMappingURL=repoAnalysisPayload.js.map