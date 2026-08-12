import { PublicJobApplication } from "@/features/applications/components/PublicJobApplication";

export default async function PublicJobPage({ params }: { params: Promise<{ orgSlug: string; jobSlug: string }> }) {
  const { orgSlug, jobSlug } = await params;
  return <PublicJobApplication orgSlug={orgSlug} jobSlug={jobSlug} />;
}
