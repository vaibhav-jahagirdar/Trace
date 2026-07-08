import type { JobSubmissionRequirementsInput } from "../../validators/create/jobs.validator";
import { AppError } from "../../../../middleware/errorHandler";
import { PoolClient } from "pg";


export async function createJobSubmissionRequirementsRecord(submissionRequirementsData: JobSubmissionRequirementsInput, jobId: string, client: PoolClient) {
    const { resume_required, github_required, portfolio_required, problem_solving_profile_required, linkedin_required, project_explanation_required, feature_explanation_required, zip_upload_allowed } = submissionRequirementsData;
    const submissionRequirementsResult = await client.query(
        `INSERT INTO job_submission_requirements
         (job_id, resume_required, github_required, portfolio_required, problem_solving_profile_required, linkedin_required, project_explanation_required, feature_explanation_required, zip_upload_allowed)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id `,
         [jobId, resume_required, github_required, portfolio_required, problem_solving_profile_required, linkedin_required, project_explanation_required, feature_explanation_required, zip_upload_allowed]
    )
    if (submissionRequirementsResult.rowCount === 0) {
        throw new AppError("Failed to create job submission requirements record", 500);
    }
    return submissionRequirementsResult.rows[0].id;

}