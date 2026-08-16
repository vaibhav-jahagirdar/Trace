import { getDb } from "../../../config/db";
import { listOrganizationJobs } from "./jobs.list.service";

export async function getOrganizationDashboard(organizationId: string) {
  const jobs = await listOrganizationJobs(organizationId, { status: "ALL", sort: "UPDATED" });
  const db = getDb();
  const activity = await db.query<{
    job_id: string;
    title: string;
    status: string;
    updated_at: string;
  }>(
    `SELECT id AS job_id, title, status, updated_at
     FROM jobs
     WHERE organization_id = $1 AND deleted_at IS NULL
     ORDER BY updated_at DESC
     LIMIT 8`,
    [organizationId],
  );

  const activeJobs = jobs.jobs.filter((job) => job.status === "PUBLISHED" || job.status === "PAUSED");
  const attention = activeJobs
    .filter((job) => job.kpis.applications > 0 && job.kpis.evidenceReviewed < job.kpis.applications)
    .slice(0, 8)
    .map((job) => ({
      jobId: job.id,
      job: job.title,
      detail: `${job.kpis.applications - job.kpis.evidenceReviewed} applications still need evidence review`,
      action: "Review pipeline",
      tone: "gap" as const,
    }));

  return {
    summary: {
      activeJobs: jobs.summary.active,
      drafts: jobs.summary.drafts,
      applications: jobs.jobs.reduce((sum, job) => sum + job.kpis.applications, 0),
      needsAttention: attention.length,
      upcomingInterviews: jobs.jobs.reduce((sum, job) => sum + job.kpis.interviewing, 0),
    },
    activeJobs: activeJobs.map((job) => ({
      id: job.id,
      title: job.title,
      status: job.status === "PAUSED" ? "Paused" : "Published",
      applications: job.kpis.applications,
      eligible: job.kpis.eligible,
      evaluating: job.kpis.evidenceReviewed,
      ready: job.kpis.shortlisted,
      interviews: job.kpis.interviewing,
      closes: job.closedAt ? new Date(job.closedAt).toLocaleDateString() : "Open",
      health: job.kpis.evidenceReviewed < job.kpis.applications ? "review" as const : "healthy" as const,
      healthNote: job.kpis.evidenceReviewed < job.kpis.applications ? "Repository evidence is still being reviewed." : "Evidence pipeline is current.",
    })),
    attention,
    interviews: [],
    drafts: jobs.drafts.map((draft) => ({
      id: draft.id,
      title: draft.title,
      configured: Math.min(100, Math.round((draft.currentStep / 6) * 100)),
      missing: [`Step ${draft.currentStep + 1} of 6 is incomplete`],
    })),
    activity: activity.rows.map((item) => ({
      when: new Date(item.updated_at).toLocaleDateString(),
      what: `${item.title} was updated`,
      where: item.status,
      jobId: item.job_id,
    })),
    recentlyClosed: jobs.jobs.filter((job) => job.status === "CLOSED").slice(0, 6).map((job) => ({
      id: job.id,
      title: job.title,
      line: `${job.kpis.applications} applications · ${job.kpis.interviewing} interviews`,
      closed: job.closedAt ? new Date(job.closedAt).toLocaleDateString() : "Closed",
    })),
  };
}
