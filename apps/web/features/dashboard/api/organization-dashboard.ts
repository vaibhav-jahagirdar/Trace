import { api } from "@/lib/api/client";
import type { ActivityItem, AttentionItem, ClosedJob, DraftJob, InterviewGroup, JobRow } from "@/components/dashboard/org-mock";

export interface OrganizationDashboardResponse {
  summary: { activeJobs: number; drafts: number; applications: number; needsAttention: number; upcomingInterviews: number };
  activeJobs: JobRow[];
  attention: AttentionItem[];
  interviews: InterviewGroup[];
  drafts: DraftJob[];
  activity: ActivityItem[];
  recentlyClosed: ClosedJob[];
}

export function getOrganizationDashboard(orgId: string) {
  return api.get<OrganizationDashboardResponse>(`/organizations/${orgId}/dashboard`);
}
