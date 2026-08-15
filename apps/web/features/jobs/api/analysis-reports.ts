import { api } from "@/lib/api/client";

export interface JobApplicationAnalysisReportsResponse {
  application: { id: string; candidateName: string; jobTitle: string };
  stage1: unknown;
  stage2a: unknown;
  stage2c: unknown;
  scoreAudit: unknown;
}

export function getJobApplicationAnalysisReports(
  orgId: string,
  jobId: string,
  applicationId: string,
) {
  return api.get<JobApplicationAnalysisReportsResponse>(
    `/organizations/${orgId}/jobs/${jobId}/applications/${applicationId}/analysis-reports`,
  );
}

export function queueRepositoryAnalysis(
  orgId: string,
  jobId: string,
  applicationId: string,
) {
  return api.post<{ queued: boolean; taskId: string | null }>(
    `/organizations/${orgId}/jobs/${jobId}/applications/${applicationId}/repository-plan`,
  );
}
