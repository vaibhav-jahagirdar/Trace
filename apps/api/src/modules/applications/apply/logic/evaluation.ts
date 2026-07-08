import { toGetJobDto } from "../../../jobs/services/helpers/getJobDto";
import { ApplyJobBody } from "../validator";

export const EDUCATION_LEVEL_RANK = {
  NONE: 0,
  HIGH_SCHOOL: 1,
  DIPLOMA: 2,
  UNDERGRADUATE: 3,
  POSTGRADUATE: 4,
} as const;

export function evaluateHardGate(
  jobResult: ReturnType<typeof toGetJobDto>,
  eligibilityData: ApplyJobBody["eligibility"],
) {
  const eligibilityRequirements = jobResult.eligibility;
  const applicationEligibility = eligibilityData;
  let finalResult = false;

  const failedExperienceGate =
    eligibilityRequirements.experience_min_years !== null &&
    applicationEligibility.yearsOfProfessionalExperience <
      eligibilityRequirements.experience_min_years;

  const failedNoticePeriodGate =
    eligibilityRequirements.notice_period_max_days !== null &&
    applicationEligibility.noticePeriodDays <
      eligibilityRequirements.notice_period_max_days;
  const failedEducationGate =
    eligibilityRequirements.minimum_education_level !== null &&
    EDUCATION_LEVEL_RANK[applicationEligibility.highestEducationLevel] <
      EDUCATION_LEVEL_RANK[
        eligibilityRequirements.minimum_education_level as keyof typeof EDUCATION_LEVEL_RANK
      ];

    
}
