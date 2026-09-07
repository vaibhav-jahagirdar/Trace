import { toGetJobDto } from "../../../jobs/services/helpers/getJobDto";
import { ApplyJobBody } from "../validator";

export const EDUCATION_LEVEL_RANK = {
  NONE: 0,
  HIGH_SCHOOL: 1,
  DIPLOMA: 2,
  UNDERGRADUATE: 3,
  POSTGRADUATE: 4,
} as const;
export const HARD_GATE_REJECTION_CODES = {
  EXPERIENCE_BELOW_MINIMUM: "EXPERIENCE_BELOW_MINIMUM",
  EXPERIENCE_ABOVE_MAXIMUM: "EXPERIENCE_ABOVE_MAXIMUM",
  NOTICE_PERIOD_TOO_LONG: "NOTICE_PERIOD_TOO_LONG",
  EDUCATION_BELOW_MINIMUM: "EDUCATION_BELOW_MINIMUM",
  WORK_AUTHORIZATION_REQUIRED: "WORK_AUTHORIZATION_REQUIRED",
  VISA_SPONSORSHIP_NOT_AVAILABLE: "VISA_SPONSORSHIP_NOT_AVAILABLE",
  RELOCATION_REQUIRED: "RELOCATION_REQUIRED",
  REMOTE_COUNTRY_RESTRICTION: "REMOTE_COUNTRY_RESTRICTION",
} as const;

export type HardGateRejectionCode =
  (typeof HARD_GATE_REJECTION_CODES)[keyof typeof HARD_GATE_REJECTION_CODES];
export function evaluateHardGate(
  jobResult: ReturnType<typeof toGetJobDto>,
  eligibilityData: ApplyJobBody["eligibility"],
) {
  const {
    work_mode,
    remote_scope,
    country,
    eligibility,
  } = jobResult;

  const {
    yearsOfProfessionalExperience,
    highestEducationLevel,
    noticePeriodDays,
    willingToRelocate,
    requiresVisaSponsorship,
    workAuthorized,
    currentCountry,
    currentState,
    currentCity,
  } = eligibilityData;

  const rejectionCodes: HardGateRejectionCode[] = [];



  if (
    eligibility.experience_min_years !== null &&
    yearsOfProfessionalExperience < eligibility.experience_min_years
  ) {
    rejectionCodes.push(
      HARD_GATE_REJECTION_CODES.EXPERIENCE_BELOW_MINIMUM,
    );
  }

  if (
    eligibility.experience_max_years !== null &&
    yearsOfProfessionalExperience > eligibility.experience_max_years
  ) {
    rejectionCodes.push(
      HARD_GATE_REJECTION_CODES.EXPERIENCE_ABOVE_MAXIMUM,
    );
  }



  if (
    eligibility.notice_period_max_days !== null &&
    noticePeriodDays > eligibility.notice_period_max_days
  ) {
    rejectionCodes.push(
      HARD_GATE_REJECTION_CODES.NOTICE_PERIOD_TOO_LONG,
    );
  }

 

  if (
    eligibility.minimum_education_level !== null &&
    EDUCATION_LEVEL_RANK[highestEducationLevel] <
      EDUCATION_LEVEL_RANK[
        eligibility.minimum_education_level as keyof typeof EDUCATION_LEVEL_RANK
      ]
  ) {
    rejectionCodes.push(
      HARD_GATE_REJECTION_CODES.EDUCATION_BELOW_MINIMUM,
    );
  }

 


if (eligibility.work_authorization_required && !workAuthorized) {
  if (requiresVisaSponsorship) {
    if (!eligibility.visa_sponsorship) {
      rejectionCodes.push(
        HARD_GATE_REJECTION_CODES.VISA_SPONSORSHIP_NOT_AVAILABLE,
      );
    }
  } else {
    rejectionCodes.push(
      HARD_GATE_REJECTION_CODES.WORK_AUTHORIZATION_REQUIRED,
    );
  }
}

 

  // Location fields are currently user-entered strings. Keep matching
  // conservative: normalize accents/punctuation and map only unambiguous,
  // maintained aliases. Do not use a generic fuzzy-distance match here; it
  // can silently treat different cities or regions as equivalent.
  const placeAliases: Record<string, string> = {
    bangalore: "bengaluru",
    bombay: "mumbai",
    calcutta: "kolkata",
    madras: "chennai",
    newdelhi: "delhi",
    bharat: "india",
  };
  const normalizePlace = (value: string | null | undefined) => {
    const compact = (value ?? "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    return placeAliases[compact] ?? compact;
  };
  const matchesPlace = (candidate: string | null | undefined, target: string | null | undefined) => {
    const left = normalizePlace(candidate);
    const right = normalizePlace(target);
    return left !== "" && right !== "" && left === right;
  };
  const sameCountry = eligibilityData.currentCountryCode && jobResult.country_code
    ? eligibilityData.currentCountryCode === jobResult.country_code
    : matchesPlace(currentCountry, country);
  const sameState = sameCountry && eligibilityData.currentStateCode && jobResult.state_code
    ? eligibilityData.currentStateCode === jobResult.state_code
    : matchesPlace(currentState, jobResult.state);
  const sameCity = sameState && matchesPlace(currentCity, jobResult.city);
  const alreadyLocatedThere = sameCountry && (sameCity || sameState);

  if (
    (work_mode === "ONSITE" || work_mode === "HYBRID") &&
    !alreadyLocatedThere &&
    !willingToRelocate
  ) {
  rejectionCodes.push(
    HARD_GATE_REJECTION_CODES.RELOCATION_REQUIRED,
  );
}

  if (
    work_mode === "REMOTE" &&
    remote_scope === "COUNTRY" &&
    !sameCountry
  ) {
    rejectionCodes.push(
      HARD_GATE_REJECTION_CODES.REMOTE_COUNTRY_RESTRICTION,
    );
  }

  if (
    work_mode === "REMOTE" &&
    remote_scope === "REGION" &&
    !(sameCountry && sameState)
  ) {
    rejectionCodes.push(HARD_GATE_REJECTION_CODES.REMOTE_COUNTRY_RESTRICTION);
  }

  return {
  passed: rejectionCodes.length === 0,
  primaryRejectionCode:
    rejectionCodes[0] ?? null,
  rejectionCodes,
};
}
