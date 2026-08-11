"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJobEligibilityCriteriaRecord = createJobEligibilityCriteriaRecord;
const errorHandler_1 = require("../../../../middleware/errorHandler");
async function createJobEligibilityCriteriaRecord(eligibilityCriteriaData, jobId, client) {
    const { currency, salary_min, salary_max, experience_min_years, experience_ideal_years, experience_max_years, notice_period_ideal_days, notice_period_max_days, relocation_assistance, visa_sponsorship, work_authorization_required, minimum_education_level } = eligibilityCriteriaData;
    const eligibilityCriteriaResult = await client.query(`INSERT INTO job_eligibility_criteria
         (job_id, currency, salary_min, salary_max, experience_min_years, experience_ideal_years, experience_max_years, notice_period_ideal_days, notice_period_max_days, relocation_assistance, visa_sponsorship, work_authorization_required, minimum_education_level)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING id `, [jobId, currency, salary_min, salary_max, experience_min_years, experience_ideal_years, experience_max_years, notice_period_ideal_days, notice_period_max_days, relocation_assistance, visa_sponsorship, work_authorization_required, minimum_education_level]);
    if (eligibilityCriteriaResult.rowCount === 0) {
        throw new errorHandler_1.AppError("Failed to create job eligibility criteria record", 500);
    }
    return eligibilityCriteriaResult.rows[0].id;
}
//# sourceMappingURL=eligibilityCriteria.js.map