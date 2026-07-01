import type { JobEligibilityCriteriaInput } from "../../jobs.validator";
import { PoolClient } from "pg";
import { AppError } from "../../../../middleware/errorHandler";

export async function createJobEligibilityCriteriaRecord(eligibilityCriteriaData: JobEligibilityCriteriaInput, jobId: string, client: PoolClient) {
    const  {currency, salary_min, salary_max, experience_min_years, experience_ideal_years, experience_max_years, notice_period_ideal_days, notice_period_max_days, relocation_supported, visa_sponsorship, work_authorization_required, minimum_education_level} = eligibilityCriteriaData;
    const eligibilityCriteriaResult = await client.query(
        `INSERT INTO job_eligibility_criteria
         (job_id, currency, salary_min, salary_max, experience_min_years, experience_ideal_years, experience_max_years, notice_period_ideal_days, notice_period_max_days, relocation_supported, visa_sponsorship, work_authorization_required, minimum_education_level)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING id `,
         [jobId, currency, salary_min, salary_max, experience_min_years, experience_ideal_years, experience_max_years, notice_period_ideal_days, notice_period_max_days, relocation_supported, visa_sponsorship, work_authorization_required, minimum_education_level]
    );

    if (eligibilityCriteriaResult.rowCount === 0) {
        throw new AppError("Failed to create job eligibility criteria record", 500);
    }

    return eligibilityCriteriaResult.rows[0].id;
}