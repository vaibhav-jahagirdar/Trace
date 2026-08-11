export declare const REQUIREMENT_BUCKETS: {
    readonly WITH_MANDATORY: {
        readonly MANDATORY: 60;
        readonly PREFERRED: 35;
        readonly BONUS: 5;
    };
    readonly WITHOUT_MANDATORY: {
        readonly MANDATORY: 0;
        readonly PREFERRED: 90;
        readonly BONUS: 10;
    };
    readonly WITHOUT_BONUS: {
        readonly MANDATORY: 62.5;
        readonly PREFERRED: 37.5;
        readonly BONUS: 0;
    };
    readonly ONLY_PREFERRED: {
        readonly MANDATORY: 0;
        readonly PREFERRED: 100;
        readonly BONUS: 0;
    };
};
export declare const JOB_ROLE_POLICY: {
    readonly INTERN: {
        readonly label: "Intern";
        readonly experience: {
            readonly minYears: 0;
            readonly maxYears: 0;
        };
        readonly requirements: {
            readonly mandatory: 3;
            readonly preferred: 3;
            readonly preferredWithoutMandatory: 6;
            readonly bonus: 2;
        };
    };
    readonly FRESHER: {
        readonly label: "Fresher";
        readonly experience: {
            readonly minYears: 0;
            readonly maxYears: 1;
        };
        readonly requirements: {
            readonly mandatory: 4;
            readonly preferred: 4;
            readonly preferredWithoutMandatory: 8;
            readonly bonus: 3;
        };
    };
    readonly JUNIOR: {
        readonly label: "Junior";
        readonly experience: {
            readonly minYears: 1;
            readonly maxYears: 2;
        };
        readonly requirements: {
            readonly mandatory: 5;
            readonly preferred: 5;
            readonly preferredWithoutMandatory: 10;
            readonly bonus: 4;
        };
    };
    readonly MID: {
        readonly label: "Mid-Level";
        readonly experience: {
            readonly minYears: 3;
            readonly maxYears: 5;
        };
        readonly requirements: {
            readonly mandatory: 6;
            readonly preferred: 6;
            readonly preferredWithoutMandatory: 12;
            readonly bonus: 5;
        };
    };
    readonly SENIOR: {
        readonly label: "Senior";
        readonly experience: {
            readonly minYears: 6;
            readonly maxYears: 8;
        };
        readonly requirements: {
            readonly mandatory: 8;
            readonly preferred: 8;
            readonly preferredWithoutMandatory: 16;
            readonly bonus: 6;
        };
    };
    readonly STAFF: {
        readonly label: "Staff";
        readonly experience: {
            readonly minYears: 9;
            readonly maxYears: 12;
        };
        readonly requirements: {
            readonly mandatory: 10;
            readonly preferred: 10;
            readonly preferredWithoutMandatory: 20;
            readonly bonus: 8;
        };
    };
    readonly PRINCIPAL: {
        readonly label: "Principal";
        readonly experience: {
            readonly minYears: 13;
            readonly maxYears: null;
        };
        readonly requirements: {
            readonly mandatory: 12;
            readonly preferred: 12;
            readonly preferredWithoutMandatory: 24;
            readonly bonus: 10;
        };
    };
};
export type JobRole = keyof typeof JOB_ROLE_POLICY;
export declare const JOB_ROLE_SUCCESS_SIGNAL_POLICY: {
    readonly INTERN: {
        readonly minSelections: 0;
        readonly maxSelections: 2;
    };
    readonly FRESHER: {
        readonly minSelections: 1;
        readonly maxSelections: 3;
    };
    readonly JUNIOR: {
        readonly minSelections: 2;
        readonly maxSelections: 4;
    };
    readonly MID: {
        readonly minSelections: 3;
        readonly maxSelections: 5;
    };
    readonly SENIOR: {
        readonly minSelections: 4;
        readonly maxSelections: 6;
    };
    readonly STAFF: {
        readonly minSelections: 5;
        readonly maxSelections: 7;
    };
    readonly PRINCIPAL: {
        readonly minSelections: 5;
        readonly maxSelections: 8;
    };
};
//# sourceMappingURL=jobPolicy.d.ts.map