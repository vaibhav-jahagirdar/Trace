import { JobDefinitionWizard } from "../components/JobDefinitionWizard";

type CreateJobPageProps = {
  orgId: string;
};

export default function CreateJobPage({
  orgId,
}: CreateJobPageProps) {
  return <JobDefinitionWizard orgId={orgId} />;
}