import { api } from "@/lib/api/client";

export type JobsStatus = "ALL" | "PUBLISHED" | "DRAFT" | "PAUSED" | "CLOSED";

export interface OrganizationJob {
  id: string;
  title: string;
  department: string | null;
  role: string | null;
  status: Exclude<JobsStatus, "ALL">;
  employmentType: string;
  workMode: string;
  openPositions: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  closedAt: string | null;
  kpis: {
    applications: number;
    eligible: number;
    evidenceReviewed: number;
    shortlisted: number;
    interviewing: number;
  };
}

export interface OrganizationJobDraft {
  id: string;
  title: string;
  currentStep: number;
  updatedAt: string;
}

export interface OrganizationJobsResponse {
  summary: {
    all: number;
    active: number;
    drafts: number;
    paused: number;
    closed: number;
  };
  jobs: OrganizationJob[];
  drafts: OrganizationJobDraft[];
}

export interface OrganizationJobsFilters {
  status?: JobsStatus;
  search?: string;
  department?: string;
  role?: string;
  workMode?: string;
  employmentType?: string;
  sort?: "UPDATED" | "CREATED" | "TITLE";
}

export function getOrganizationJobs(
  orgId: string,
  filters: OrganizationJobsFilters = {},
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value && value !== "ALL") params.set(key, value);
  }

  const query = params.toString();
  return api.get<OrganizationJobsResponse>(
    `/organizations/${orgId}/jobs${query ? `?${query}` : ""}`,
  );
}
