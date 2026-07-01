export const REQUIREMENT_BUCKETS = {
  WITH_MANDATORY: {
    MANDATORY: 60,
    PREFERRED: 35,
    BONUS: 5,
  },

  WITHOUT_MANDATORY: {
    MANDATORY: 0,
    PREFERRED: 90,
    BONUS: 10,
  },

  WITHOUT_BONUS: {
    MANDATORY: 62.5,
    PREFERRED: 37.5,
    BONUS: 0,
  },

  ONLY_PREFERRED: {
    MANDATORY: 0,
    PREFERRED: 100,
    BONUS: 0,
  },
} as const;

export const JOB_ROLE_POLICY = {
  INTERN: {
    label: "Intern",

    experience: {
      minYears: 0,
      maxYears: 0,
    },

    requirements: {
      mandatory: 3,
      preferred: 3,
      preferredWithoutMandatory: 6,
      bonus: 2,
    },
  },

  FRESHER: {
    label: "Fresher",

    experience: {
      minYears: 0,
      maxYears: 1,
    },

    requirements: {
      mandatory: 4,
      preferred: 4,
      preferredWithoutMandatory: 8,
      bonus: 3,
    },
  },

  JUNIOR: {
    label: "Junior",

    experience: {
      minYears: 1,
      maxYears: 2,
    },

    requirements: {
      mandatory: 5,
      preferred: 5,
      preferredWithoutMandatory: 10,
      bonus: 4,
    },
  },

  MID: {
    label: "Mid-Level",

    experience: {
      minYears: 3,
      maxYears: 5,
    },

    requirements: {
      mandatory: 6,
      preferred: 6,
      preferredWithoutMandatory: 12,
      bonus: 5,
    },
  },

  SENIOR: {
    label: "Senior",

    experience: {
      minYears: 6,
      maxYears: 8,
    },

    requirements: {
      mandatory: 8,
      preferred: 8,
      preferredWithoutMandatory: 16,
      bonus: 6,
    },
  },

  STAFF: {
    label: "Staff",

    experience: {
      minYears: 9,
      maxYears: 12,
    },

    requirements: {
      mandatory: 10,
      preferred: 10,
      preferredWithoutMandatory: 20,
      bonus: 8,
    },
  },

  PRINCIPAL: {
    label: "Principal",

    experience: {
      minYears: 13,
      maxYears: null,
    },

    requirements: {
      mandatory: 12,
      preferred: 12,
      preferredWithoutMandatory: 24,
      bonus: 10,
    },
  },
} as const;

export type JobRole = keyof typeof JOB_ROLE_POLICY;
