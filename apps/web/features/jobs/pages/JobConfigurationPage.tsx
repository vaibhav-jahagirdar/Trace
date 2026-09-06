"use client";
import { PublishJobPage } from "../components/PublishJobPage";
export default function JobConfigurationPage({ orgId, jobId }: { orgId: string; jobId: string }) {
  return <PublishJobPage orgId={orgId} jobId={jobId} />;
}
