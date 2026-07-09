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
    currentCountry,
    currentState,
    currentCity
  } = eligibilityData;
  const eligibilityRecordResult = await client.query(
    `INSERT INTO application_eligibility
        (job_application_id, years_of_professional_experience,
         highest_education_level, notice_period_days, willing_to_relocate_for_this_job, 
        requires_visa_sponsorship, work_authorized,
        current_country, current_state, current_city)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`,
    [
      applicationId,
      yearsOfProfessionalExperience,
      highestEducationLevel,
      noticePeriodDays,
      willingToRelocate,
      requiresVisaSponsorship,
      workAuthorized,
      currentCountry,
      currentState,
      currentCity
    ],
  );
  if (eligibilityRecordResult.rowCount === 0) {
    throw new AppError("Failed to create eligibility record");
  }
}
