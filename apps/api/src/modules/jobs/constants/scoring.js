"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVALUATION_WEIGHT_POLICY = exports.JOB_ROLE_POLICY = exports.PRIORITY_TYPES = void 0;
exports.PRIORITY_TYPES = {
    MANDATORY: "MANDATORY",
    PREFERRED: "PREFERRED",
    BONUS: "BONUS",
};
exports.JOB_ROLE_POLICY = {
    INTERN: {
        minDimensions: 3,
        maxDimensions: 5,
    },
    FRESHER: {
        minDimensions: 4,
        maxDimensions: 6,
    },
    JUNIOR: {
        minDimensions: 5,
        maxDimensions: 7,
    },
    MID: {
        minDimensions: 6,
        maxDimensions: 8,
    },
    SENIOR: {
        minDimensions: 7,
        maxDimensions: 9,
    },
    STAFF: {
        minDimensions: 8,
        maxDimensions: 10,
    },
    PRINCIPAL: {
        minDimensions: 8,
        maxDimensions: 10,
    },
};
exports.EVALUATION_WEIGHT_POLICY = {
    MIN_WEIGHT: 1,
    MAX_WEIGHT: 100,
    REQUIRED_TOTAL: 100,
};
//# sourceMappingURL=scoring.js.map