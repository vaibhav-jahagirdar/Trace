import { api } from "@/lib/api/client";

export type JobUpdate = { title?: string; slug?: string; department?: string | null; description?: string | null; open_positions?: number; work_mode?: string; country?: string; state?: string | null; city?: string | null };
export function updateJob(orgId: string, jobId: string, payload: JobUpdate) { return api.patch(`/organizations/${orgId}/jobs/${jobId}`, payload); }
export function transitionJob(orgId: string, jobId: string, status: "PAUSED" | "PUBLISHED" | "CLOSED") { return api.post(`/organizations/${orgId}/jobs/${jobId}/status`, { status }); }
export function deleteJob(orgId: string, jobId: string) { return api.delete(`/organizations/${orgId}/jobs/${jobId}`); }
