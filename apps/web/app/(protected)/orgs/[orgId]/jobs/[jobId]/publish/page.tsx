import { PublishJobPage } from "@/features/jobs/components/PublishJobPage";

export default async function PublishPage({ params }: { params: Promise<{ orgId: string; jobId: string }> }) {
  const { orgId, jobId } = await params;
  return <PublishJobPage orgId={orgId} jobId={jobId} />;
}
