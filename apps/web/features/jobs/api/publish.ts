import { api } from "@/lib/api/client";

export type PublishPreview = {
  id: string;
  title: string;
  department?: string | null;
  employment_type?: string | null;
  work_mode?: string | null;
  remote_scope?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  open_positions?: number | null;
  description?: string | null;
  status: string;

  role_category_name?: string | null;
  role_category_code?: string | null;

  eligibility: Record<string, unknown>;
  submission_requirements: Record<string, unknown>;

  requirements: {
    requirement_type: string;
    priority_type: string;
    name: string;
    category?: string | null;
    weight: number | string;
  }[];

  evaluation_priorities: {
    code: string;
    name: string;
    description?: string | null;
    weight: number;
  }[];

  evidence_priorities: {
    code: string;
    name: string;
    description?: string | null;
    weight: number;
  }[];

  success_signals: {
    code: string;
    name: string;
    description?: string | null;
    weight: number;
  }[];
};

export type PublishJobResponse = {
  id: string;
  status: string;
  published_at: string;
};

export function getPublishPreview(orgId: string, jobId: string) {
  return api.get<{ preview: PublishPreview }>(
    `/organizations/${orgId}/jobs/${jobId}/publish-preview`,
  );
}

export function publishJob(orgId: string, jobId: string) {
  return api.post<PublishJobResponse>(
    `/organizations/${orgId}/jobs/${jobId}/publish`,
  );
}