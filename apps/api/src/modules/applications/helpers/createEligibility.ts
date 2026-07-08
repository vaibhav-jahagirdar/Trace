import { PoolClient } from "pg";
import { ApplyJobBody } from "../apply/validator";
import { AppError } from "../../../middleware/errorHandler";

export async function createEligibilityRecord(
  client: PoolClient,
  applicationId: string,
  eligibilityData: ApplyJobBody["eligibility"],
) {
  const {
    yearsOfProfessionalExperience,
    highestEducationLevel,
    noticePeriodDays,
    willingToRelocate,
    requiresVisaSponsorship,
    workAuthorized,
  } = eligibilityData;
  const eligibilityRecordResult = await client.query(
    `INSERT INTO application_eligibility
        (job_application_id, years_of_professional_experience,
         highest_education_level, notice_period_days, willing_to_relocate, 
        requires_visa_sponsorship, work_authorized)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
    [
      applicationId,
      yearsOfProfessionalExperience,
      highestEducationLevel,
      noticePeriodDays,
      willingToRelocate,
      requiresVisaSponsorship,
      workAuthorized,
    ],
  );
  if (eligibilityRecordResult.rowCount === 0) {
    throw new AppError("Failed to create eligibility record");
  }
}
