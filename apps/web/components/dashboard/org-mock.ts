export type Health = "healthy" | "review" | "context";

export type JobRow = {
  id: string;
  title: string;
  status: string;
  applications: number;
  eligible: number;
  evaluating: number;
  ready: number;
  interviews: number;
  closes: string;
  health: Health;
  healthNote: string;
};

export type AttentionItem = { jobId: string; job: string; detail: string; action: string; tone: "verified" | "conflict" | "gap" };
export type InterviewGroup = { day: string; items: { time: string; who: string; job: string; kind: string }[] };
export type DraftJob = { id: string; title: string; configured: number; missing: string[]; imported?: boolean };
export type ActivityItem = { when: string; what: string; where: string; jobId: string };
export type ClosedJob = { id: string; title: string; line: string; closed: string };

// Replace these arrays with API-backed data without changing the dashboard components.
export const EMPTY_SUMMARY = [
  { value: "0", label: "active jobs", tone: "ink" },
  { value: "0", label: "drafts", tone: "olive" },
  { value: "0", label: "applications", tone: "olive" },
  { value: "0", label: "need attention", tone: "conflict" },
  { value: "0", label: "upcoming interviews", tone: "ink" },
] as const;

export const EMPTY_DASHBOARD_DATA = {
  activeJobs: [] as JobRow[],
  attention: [] as AttentionItem[],
  interviews: [] as InterviewGroup[],
  drafts: [] as DraftJob[],
  activity: [] as ActivityItem[],
  recentlyClosed: [] as ClosedJob[],
};
