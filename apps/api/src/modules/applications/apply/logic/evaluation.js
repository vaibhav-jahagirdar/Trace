"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HARD_GATE_REJECTION_CODES = exports.EDUCATION_LEVEL_RANK = void 0;
exports.evaluateHardGate = evaluateHardGate;
exports.EDUCATION_LEVEL_RANK = {
    NONE: 0,
    HIGH_SCHOOL: 1,
    DIPLOMA: 2,
    UNDERGRADUATE: 3,
    POSTGRADUATE: 4,
};
exports.HARD_GATE_REJECTION_CODES = {
    EXPERIENCE_BELOW_MINIMUM: "EXPERIENCE_BELOW_MINIMUM",
    EXPERIENCE_ABOVE_MAXIMUM: "EXPERIENCE_ABOVE_MAXIMUM",
    NOTICE_PERIOD_TOO_LONG: "NOTICE_PERIOD_TOO_LONG",
    EDUCATION_BELOW_MINIMUM: "EDUCATION_BELOW_MINIMUM",
    WORK_AUTHORIZATION_REQUIRED: "WORK_AUTHORIZATION_REQUIRED",
    VISA_SPONSORSHIP_NOT_AVAILABLE: "VISA_SPONSORSHIP_NOT_AVAILABLE",
    RELOCATION_REQUIRED: "RELOCATION_REQUIRED",
    REMOTE_COUNTRY_RESTRICTION: "REMOTE_COUNTRY_RESTRICTION",
};
function evaluateHardGate(jobResult, eligibilityData) {
    const { work_mode, remote_scope, country, eligibility, } = jobResult;
    const { yearsOfProfessionalExperience, highestEducationLevel, noticePeriodDays, willingToRelocate, requiresVisaSponsorship, workAuthorized, currentCountry, } = eligibilityData;
    const rejectionCodes = [];
    if (eligibility.experience_min_years !== null &&
        yearsOfProfessionalExperience < eligibility.experience_min_years) {
        rejectionCodes.push(exports.HARD_GATE_REJECTION_CODES.EXPERIENCE_BELOW_MINIMUM);
    }
    if (eligibility.experience_max_years !== null &&
        yearsOfProfessionalExperience > eligibility.experience_max_years) {
        rejectionCodes.push(exports.HARD_GATE_REJECTION_CODES.EXPERIENCE_ABOVE_MAXIMUM);
    }
    if (eligibility.notice_period_max_days !== null &&
        noticePeriodDays > eligibility.notice_period_max_days) {
        rejectionCodes.push(exports.HARD_GATE_REJECTION_CODES.NOTICE_PERIOD_TOO_LONG);
    }
    if (eligibility.minimum_education_level !== null &&
        exports.EDUCATION_LEVEL_RANK[highestEducationLevel] <
            exports.EDUCATION_LEVEL_RANK[eligibility.minimum_education_level]) {
        rejectionCodes.push(exports.HARD_GATE_REJECTION_CODES.EDUCATION_BELOW_MINIMUM);
    }
    if (eligibility.work_authorization_required && !workAuthorized) {
        if (requiresVisaSponsorship) {
            if (!eligibility.visa_sponsorship) {
                rejectionCodes.push(exports.HARD_GATE_REJECTION_CODES.VISA_SPONSORSHIP_NOT_AVAILABLE);
            }
        }
        else {
            rejectionCodes.push(exports.HARD_GATE_REJECTION_CODES.WORK_AUTHORIZATION_REQUIRED);
        }
    }
    if ((work_mode === "ONSITE" || work_mode === "HYBRID") &&
        !willingToRelocate) {
        rejectionCodes.push(exports.HARD_GATE_REJECTION_CODES.RELOCATION_REQUIRED);
    }
    if (work_mode === "REMOTE" &&
        remote_scope === "COUNTRY" &&
        currentCountry !== country) {
        rejectionCodes.push(exports.HARD_GATE_REJECTION_CODES.REMOTE_COUNTRY_RESTRICTION);
    }
    return {
        passed: rejectionCodes.length === 0,
        primaryRejectionCode: rejectionCodes[0] ?? null,
        rejectionCodes,
    };
}
//# sourceMappingURL=evaluation.js.map