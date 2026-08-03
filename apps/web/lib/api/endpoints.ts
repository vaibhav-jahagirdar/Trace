export const API = {
  auth: {
    signup: "/auth/signup",
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    me: "/auth/me",
  },

  organizations: {
    list: "/organizations",
    create: "/organizations",

    detail: (organizationId: string) =>
      `/organizations/${organizationId}`,
  },

  jobs: {
    list: "/jobs",

    create: "/jobs",

    detail: (jobId: string) =>
      `/jobs/${jobId}`,

    publish: (jobId: string) =>
      `/jobs/${jobId}/publish`,
  },

  applications: {
    apply: (jobId: string) =>
      `/jobs/${jobId}/apply`,

    detail: (applicationId: string) =>
      `/applications/${applicationId}`,

    analysis: (applicationId: string) =>
      `/applications/${applicationId}/analysis`,
  },

  invites: {
    accept: (token: string) =>
      `/invites/${token}/accept`,
  },
} as const;