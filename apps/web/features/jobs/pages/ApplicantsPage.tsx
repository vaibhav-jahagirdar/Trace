"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { OrganizationSwitcher, OrgSidebar } from "@/components/dashboard/org-sidebar";
import { getJobControlRoom, type JobControlRoomResponse } from "../api/control-room";

export default function ApplicantsPage() {
  const params = useParams<{ orgId: string; jobId: string }>();
  const { activeOrg, organizations, setActiveOrg, user } = useAuth();
  const organization = organizations.find((item) => item.orgId === params.orgId) ?? activeOrg;
  const [data, setData] = useState<JobControlRoomResponse | null>(null);
  useEffect(() => { getJobControlRoom(params.orgId, params.jobId).then(setData).catch(() => undefined); }, [params.orgId, params.jobId]);
  return <div className="flex min-h-screen w-full bg-paper text-ink"><OrgSidebar orgId={params.orgId} organization={organization} organizations={organizations} onOrganizationChange={setActiveOrg} /><main className="min-w-0 flex-1 px-6 pb-24 md:px-12"><header className="mx-auto flex max-w-6xl items-center justify-between border-b border-forest/15 py-5"><Link href={`/orgs/${params.orgId}/jobs/${params.jobId}`} className="font-mono text-xs uppercase tracking-[.16em] text-olive">← Role control room</Link><div className="flex items-center gap-4"><div className="lg:hidden"><OrganizationSwitcher className="mt-0" orgId={params.orgId} organization={organization} organizations={organizations} onOrganizationChange={setActiveOrg} /></div><span className="font-mono text-xs uppercase tracking-[.12em] text-forest">{user?.username ?? "Workspace"}</span></div></header><div className="mx-auto max-w-6xl"><section className="border-b border-forest/15 py-14"><p className="font-mono text-xs uppercase tracking-[.18em] text-olive">Applicants</p><h1 className="mt-4 text-5xl font-light tracking-[-.05em]">{data?.job.title ?? "Applicants"}</h1><p className="mt-4 text-moss">Every candidate and processing state for this role.</p></section><section className="mt-10 overflow-x-auto border-y border-forest/15"><table className="w-full min-w-[680px] text-left text-sm"><thead className="font-mono text-[10px] uppercase tracking-[.14em] text-olive"><tr><th className="py-4 font-normal">Candidate</th><th className="py-4 font-normal">Eligibility</th><th className="py-4 font-normal">Stage 1</th><th className="py-4 font-normal">Stage 2C</th><th className="py-4 font-normal">State</th><th /></tr></thead><tbody className="divide-y divide-forest/10">{data?.candidates.map((candidate) => <tr key={candidate.id}><td className="py-5 text-lg">{candidate.name}</td><td className="py-5 text-olive">{candidate.status}</td><td className="py-5 font-mono">{candidate.stage1Score ?? "—"}</td><td className="py-5 font-mono">{candidate.stage2cScore ?? "—"}</td><td className="py-5 text-olive">{candidate.stage2cStatus}</td><td className="py-5 text-right"><Link href={`/orgs/${params.orgId}/jobs/${params.jobId}/analysis/${candidate.id}`} className="inline-flex items-center gap-2 text-forest">Open analysis <ArrowRight className="size-4" /></Link></td></tr>)}</tbody></table>{data?.candidates.length === 0 && <p className="p-10 text-center text-sm text-olive">No applicants yet.</p>}</section></div></main></div>;
}
