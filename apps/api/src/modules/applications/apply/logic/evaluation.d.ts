import { toGetJobDto } from "../../../jobs/services/helpers/getJobDto";
import { ApplyJobBody } from "../validator";
export declare const EDUCATION_LEVEL_RANK: {
    readonly NONE: 0;
    readonly HIGH_SCHOOL: 1;
    readonly DIPLOMA: 2;
    readonly UNDERGRADUATE: 3;
    readonly POSTGRADUATE: 4;
};
export declare const HARD_GATE_REJECTION_CODES: {
    readonly EXPERIENCE_BELOW_MINIMUM: "EXPERIENCE_BELOW_MINIMUM";
    readonly EXPERIENCE_ABOVE_MAXIMUM: "EXPERIENCE_ABOVE_MAXIMUM";
    readonly NOTICE_PERIOD_TOO_LONG: "NOTICE_PERIOD_TOO_LONG";
    readonly EDUCATION_BELOW_MINIMUM: "EDUCATION_BELOW_MINIMUM";
    readonly WORK_AUTHORIZATION_REQUIRED: "WORK_AUTHORIZATION_REQUIRED";
    readonly VISA_SPONSORSHIP_NOT_AVAILABLE: "VISA_SPONSORSHIP_NOT_AVAILABLE";
    readonly RELOCATION_REQUIRED: "RELOCATION_REQUIRED";
    readonly REMOTE_COUNTRY_RESTRICTION: "REMOTE_COUNTRY_RESTRICTION";
};
export type HardGateRejectionCode = (typeof HARD_GATE_REJECTION_CODES)[keyof typeof HARD_GATE_REJECTION_CODES];
export declare function evaluateHardGate(jobResult: ReturnType<typeof toGetJobDto>, eligibilityData: ApplyJobBody["eligibility"]): {
    passed: boolean;
    primaryRejectionCode: HardGateRejectionCode | null;
    rejectionCodes: HardGateRejectionCode[];
};
//# sourceMappingURL=evaluation.d.ts.map