import { api } from "@/lib/api/client";

export interface JobControlRoomResponse {
  job: {
    id: string;
    title: string;
    slug: string;
    organizationSlug: string;
    department: string | null;
    role: string | null;
    status: string;
    employmentType: string;
    workMode: string;
    openPositions: number;
    description?: string | null;
    createdAt: string;
    updatedAt: string;
  };
  pipeline: {
    applied: number;
    eligible: number;
    stage1Complete: number;
    stage2aComplete: number;
    stage2cComplete: number;
    shortlisted: number;
    interviewing: number;
  };
  analysis: {
    stage1: { complete: number; running: number; waiting: number };
    stage2a: { complete: number; running: number; waiting: number };
    stage2c: { complete: number; running: number; waiting: number };
  };
  candidates: Array<{
    id: string;
    name: string;
    status: string;
    stage1Score: number | null;
    stage2cScore: number | null;
    finalScore: number | null;
    stage1Status: "COMPLETE" | "WAITING";
    stage2aStatus: "COMPLETE" | "RUNNING" | "WAITING";
    stage2cStatus: "COMPLETE" | "RUNNING" | "WAITING";
  }>;
}

export function getJobControlRoom(orgId: string, jobId: string) {
  return api.get<JobControlRoomResponse>(
    `/organizations/${orgId}/jobs/${jobId}/control-room`,
  );
}
