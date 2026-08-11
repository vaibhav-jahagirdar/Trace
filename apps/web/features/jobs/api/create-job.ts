import { api } from "@/lib/api/client";


export interface JobDraft {
  id: string;
  formData: Record<string, unknown>;
  currentStep: number;
}


export function getDraft(orgId: string) {
  return api.get<{ draft: JobDraft }>(`/organizations/${orgId}/jobs/draft`);
}

export function saveDraft(
  orgId: string,
  data: { formData: Record<string, unknown>; currentStep: number }
) {
  return api.put<{ draft: JobDraft }>(
    `/organizations/${orgId}/jobs/draft`,
    data
  );
}


export interface SubmitJobPayload {
  draftId: string;

  [key: string]: unknown;
}

export interface SubmitJobResponse {
  jobId: string;
  alreadySubmitted?: boolean;
}

export function submitJob(orgId: string, payload: SubmitJobPayload) {
  return api.post<SubmitJobResponse>(
    `/organizations/${orgId}/jobs`,
    payload
  );
}
