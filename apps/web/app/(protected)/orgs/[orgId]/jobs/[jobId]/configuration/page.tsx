import JobConfigurationPage from "@/features/jobs/pages/JobConfigurationPage";

export default async function ConfigurationPage({ params }: { params: Promise<{ orgId: string; jobId: string }> }) {
  const { orgId, jobId } = await params;
  return <JobConfigurationPage orgId={orgId} jobId={jobId} />;
}
