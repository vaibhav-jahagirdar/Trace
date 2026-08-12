import CreateJobPage from "@/features/jobs/pages/CreateJobPage";

type JobsCreatePageProps = {
  params: Promise<{
    orgId: string;
  }>;
};

export default async function JobsCreatePage({
  params,
}: JobsCreatePageProps) {
  const { orgId } = await params;

  return <CreateJobPage orgId={orgId} />;
}