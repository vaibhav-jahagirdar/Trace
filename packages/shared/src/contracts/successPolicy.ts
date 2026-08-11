export const JOB_ROLE_SUCCESS_SIGNAL_POLICY = {
  INTERN: {
    minSelections: 0,
    maxSelections: 2,
  },

  FRESHER: {
    minSelections: 1,
    maxSelections: 3,
  },

  JUNIOR: {
    minSelections: 2,
    maxSelections: 4,
  },

  MID: {
    minSelections: 3,
    maxSelections: 5,
  },

  SENIOR: {
    minSelections: 4,
    maxSelections: 6,
  },

  STAFF: {
    minSelections: 5,
    maxSelections: 7,
  },

  PRINCIPAL: {
    minSelections: 5,
    maxSelections: 8,
  },
} as const;
