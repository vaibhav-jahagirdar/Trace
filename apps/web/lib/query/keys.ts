export const queryKeys = {
  auth: {
    me: () => ["auth", "me"] as const,
  },

  organizations: {
    all: () => ["organizations"] as const,

    detail: (organizationId: string) =>
      ["organizations", organizationId] as const,
  },

  jobs: {
    all: () => ["jobs"] as const,

    list: (orgId: string) => ["jobs", orgId] as const,   

    detail: (jobId: string) =>
      ["jobs", jobId] as const,

    draft: (orgId: string) => ["jobs", orgId, "draft"] as const, 
  },

  applications: {
    all: () => ["applications"] as const,

    detail: (applicationId: string) =>
      ["applications", applicationId] as const,

    analysis: (applicationId: string) =>
      ["applications", applicationId, "analysis"] as const,
  },
} as const;