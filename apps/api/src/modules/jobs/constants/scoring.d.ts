export declare const PRIORITY_TYPES: {
    readonly MANDATORY: "MANDATORY";
    readonly PREFERRED: "PREFERRED";
    readonly BONUS: "BONUS";
};
export type PriorityType = keyof typeof PRIORITY_TYPES;
export declare const JOB_ROLE_POLICY: {
    readonly INTERN: {
        readonly minDimensions: 3;
        readonly maxDimensions: 5;
    };
    readonly FRESHER: {
        readonly minDimensions: 4;
        readonly maxDimensions: 6;
    };
    readonly JUNIOR: {
        readonly minDimensions: 5;
        readonly maxDimensions: 7;
    };
    readonly MID: {
        readonly minDimensions: 6;
        readonly maxDimensions: 8;
    };
    readonly SENIOR: {
        readonly minDimensions: 7;
        readonly maxDimensions: 9;
    };
    readonly STAFF: {
        readonly minDimensions: 8;
        readonly maxDimensions: 10;
    };
    readonly PRINCIPAL: {
        readonly minDimensions: 8;
        readonly maxDimensions: 10;
    };
};
export declare const EVALUATION_WEIGHT_POLICY: {
    readonly MIN_WEIGHT: 1;
    readonly MAX_WEIGHT: 100;
    readonly REQUIRED_TOTAL: 100;
};
export type EvaluationWeightPolicy = typeof EVALUATION_WEIGHT_POLICY;
export type JobRoleEvaluationPolicy = typeof JOB_ROLE_POLICY;
//# sourceMappingURL=scoring.d.ts.map