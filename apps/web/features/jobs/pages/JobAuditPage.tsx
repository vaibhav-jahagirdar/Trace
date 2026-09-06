"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { OrgSidebar } from "@/components/dashboard/org-sidebar";
import { getJobControlRoom, type JobControlRoomResponse } from "../api/control-room";

export default function JobAuditPage() {
  const params = useParams<{ orgId: string; jobId: string }>();
  const { activeOrg, organizations, setActiveOrg } = useAuth();
  const organization = organizations.find((item) => item.orgId === params.orgId) ?? activeOrg;
  const [data, setData] = useState<JobControlRoomResponse | null>(null);
  useEffect(() => { getJobControlRoom(params.orgId, params.jobId).then(setData).catch(() => undefined); }, [params.orgId, params.jobId]);
  return <div className="flex min-h-screen w-full bg-paper text-ink"><OrgSidebar orgId={params.orgId} organization={organization} organizations={organizations} onOrganizationChange={setActiveOrg} /><main className="min-w-0 flex-1 px-6 pb-24 md:px-12"><div className="mx-auto max-w-6xl"><Link href={`/orgs/${params.orgId}/jobs/${params.jobId}`} className="inline-block py-6 font-mono text-xs uppercase tracking-[.16em] text-olive">← Role control room</Link><section className="border-b border-forest/15 py-12"><p className="font-mono text-xs uppercase tracking-[.18em] text-olive">Audit</p><h1 className="mt-4 text-5xl font-light">Evidence and score audit</h1><p className="mt-4 max-w-2xl text-moss">Select a candidate to inspect requirement decisions, citations, coverage, and stored score inputs.</p></section><section className="mt-10 divide-y divide-forest/15 border-y border-forest/15">{data?.candidates.map((candidate) => <Link key={candidate.id} href={`/orgs/${params.orgId}/jobs/${params.jobId}/analysis/${candidate.id}?stage=audit`} className="flex items-center justify-between gap-5 py-6 hover:bg-warm/50"><div><p className="text-xl">{candidate.name}</p><p className="mt-2 font-mono text-xs uppercase tracking-[.14em] text-olive">Final {candidate.finalScore ?? "—"} · Evidence {candidate.stage2cScore ?? "—"}</p></div><span className="text-forest">Open audit →</span></Link>)}</section></div></main></div>;
}
