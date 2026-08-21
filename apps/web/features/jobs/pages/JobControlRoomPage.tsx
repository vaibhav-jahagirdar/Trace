"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { OrganizationSwitcher, OrgSidebar } from "@/components/dashboard/org-sidebar";
import { getJobControlRoom, type JobControlRoomResponse } from "../api/control-room";
import { queueRepositoryAnalysis } from "../api/analysis-reports";
import { LoadingState } from "@/components/ui/LoadingState";

const EMPTY: JobControlRoomResponse | null = null;

function label(value: string): string {
  return value.toLowerCase().split("_").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");
}

function StageStatus({ complete, running, waiting }: { complete: number; running: number; waiting: number }) {
  return <span className="font-mono text-xs text-olive">{complete} complete · {running} running · {waiting} waiting</span>;
}

function CandidateProcessing({ candidate }: { candidate: JobControlRoomResponse["candidates"][number] }) {
  // Terminal application decisions must take precedence over analysis
  // progress. A hard-gate rejection has no analysis task, so its stage
  // fields are normally WAITING; checking those first incorrectly renders
  // the candidate as "Candidate fit" loading.
  if (candidate.status === "REJECTED") {
    return <span className="font-mono text-xs uppercase tracking-[0.12em] text-destructive">Rejected</span>;
  }
  if (candidate.status === "WITHDRAWN") {
    return <span className="font-mono text-xs uppercase tracking-[0.12em] text-olive">Withdrawn</span>;
  }
  if (candidate.stage2cStatus === "RUNNING") return <LoadingState label="Repository evidence" variant="Drive" />;
  if (candidate.stage2cStatus === "COMPLETE") return <span className="font-mono text-xs uppercase tracking-[0.12em] text-forest">Evidence complete</span>;
  if (candidate.stage2aStatus === "RUNNING") return <LoadingState label="Repository plan" variant="Dots" />;
  if (candidate.stage1Status === "WAITING") return <LoadingState label="Candidate fit" variant="Orbit" />;
  if (candidate.stage2cStatus === "WAITING" && candidate.stage2aStatus === "COMPLETE") return <span className="font-mono text-xs uppercase tracking-[0.12em] text-olive">Waiting for evidence</span>;
  return <span className="font-mono text-xs uppercase tracking-[0.12em] text-forest">{label(candidate.status)}</span>;
}

export default function JobControlRoomPage() {
  const params = useParams<{ orgId: string; jobId: string }>();
  const { activeOrg, organizations, setActiveOrg, user } = useAuth();
  const organization = organizations.find((item) => item.orgId === params.orgId) ?? activeOrg;
  const [data, setData] = useState<JobControlRoomResponse | null>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState("");
  const [queueMessage, setQueueMessage] = useState<string | null>(null);
  const [queueing, setQueueing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getJobControlRoom(params.orgId, params.jobId)
      .then((result) => { if (!cancelled) setData(result); })
      .catch(() => { if (!cancelled) setError("We couldn't load this role."); });
    return () => { cancelled = true; };
  }, [params.orgId, params.jobId]);

  async function analyzeSelectedCandidate() {
    if (!selectedApplication) return;
    setQueueing(true);
    setQueueMessage(null);
    try {
      const result = await queueRepositoryAnalysis(params.orgId, params.jobId, selectedApplication);
      setQueueMessage(result.queued ? "Analysis queued. It will appear here as it progresses." : "This candidate is already queued or complete.");
      setManualOpen(false);
    } catch {
      setQueueMessage("We couldn't start analysis for this candidate.");
    } finally {
      setQueueing(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-paper text-ink">
      <OrgSidebar orgId={params.orgId} organization={organization} organizations={organizations} onOrganizationChange={setActiveOrg} />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-forest/12 bg-paper/95 px-6 py-5 backdrop-blur md:px-10 lg:px-14">
          <div className="mx-auto flex max-w-6xl items-baseline justify-between gap-6">
            <span className="font-mono text-sm uppercase tracking-[0.18em] text-forest lg:hidden">Trace</span>
            <span className="label-index hidden font-mono text-sm uppercase tracking-[0.18em] text-olive sm:block">{organization?.orgName ?? "Organization"} · ROLE CONTROL</span>
            <div className="ml-auto flex items-center gap-4"><div className="lg:hidden"><OrganizationSwitcher className="mt-0" orgId={params.orgId} organization={organization} organizations={organizations} onOrganizationChange={setActiveOrg} /></div><span className="label-index text-forest">{user?.username ?? "Workspace"}</span></div>
          </div>
        </header>

        <main className="px-6 pb-28 md:px-10 lg:px-14">
          <div className="mx-auto max-w-6xl">
            {error && <p className="py-16 text-sm text-destructive">{error}</p>}
            {!data && !error && <p className="py-16 font-mono text-xs uppercase tracking-[0.16em] text-olive">Loading role…</p>}
            {data && <>
              <section className="border-b border-forest/10 pb-10 pt-14">
                <div className="flex flex-wrap items-end justify-between gap-8">
                  <div>
                    <div className="flex flex-wrap items-center gap-3"><h1 className="font-sans text-5xl font-light leading-none tracking-[-0.05em] md:text-6xl">{data.job.title}</h1><span className="font-mono text-[11px] uppercase tracking-[0.15em] text-olive">● {label(data.job.status)}</span></div>
                    <p className="mt-5 text-sm text-olive">{data.job.department ?? data.job.role ?? "Role"} · {label(data.job.employmentType)} · {label(data.job.workMode)} · {data.job.openPositions} {data.job.openPositions === 1 ? "opening" : "openings"}</p>
                  </div>
                  <div className="flex flex-wrap gap-3"><Link href={`/orgs/${params.orgId}/jobs/${params.jobId}/publish`} className={`border px-4 py-3 text-sm transition-colors ${data.job.status === "DRAFT" ? "border-forest bg-forest text-paper hover:bg-moss" : "border-forest/30 text-forest hover:bg-warm"}`}>{data.job.status === "DRAFT" ? "Review & publish" : "Edit role"}</Link>{data.job.status !== "DRAFT" && <button type="button" className="border border-destructive/30 px-4 py-3 text-sm text-destructive hover:bg-destructive/5">Close</button>}</div>
                </div>
              </section>

              <nav className="flex gap-7 overflow-x-auto border-b border-forest/12 py-5 font-mono text-xs uppercase tracking-[0.14em] text-olive" aria-label="Job sections">
                <span className="border-b-2 border-forest pb-5 text-forest">Overview</span><Link href={`/orgs/${params.orgId}/jobs/${params.jobId}/applicants`} className="hover:text-forest">Applicants</Link><Link href={`/orgs/${params.orgId}/jobs/${params.jobId}/analysis`} className="hover:text-forest">Analysis</Link><span>Interviews</span><Link href={`/orgs/${params.orgId}/jobs/${params.jobId}/audit`} className="hover:text-forest">Audit</Link>
              </nav>

              <section className="border-b border-forest/12 py-12">
                <p className="label-index font-mono text-xs uppercase tracking-[0.18em] text-olive">Hiring pipeline</p>
                <div className="mt-8 grid grid-cols-2 gap-y-8 sm:grid-cols-4 lg:grid-cols-7">
                  {[['Applied', data.pipeline.applied], ['Eligible', data.pipeline.eligible], ['Stage 1', data.pipeline.stage1Complete], ['Stage 2A', data.pipeline.stage2aComplete], ['Stage 2C', data.pipeline.stage2cComplete], ['Shortlisted', data.pipeline.shortlisted], ['Interviewing', data.pipeline.interviewing]].map(([name, value]) => <div key={String(name)} className="border-l border-forest/15 pl-4 first:border-0 first:pl-0"><p className="font-mono text-3xl tabular-nums text-ink">{value}</p><p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-olive">{name}</p></div>)}
                </div>
              </section>

              <section className="grid gap-12 border-b border-forest/12 py-12 lg:grid-cols-[1fr_1.35fr]">
                <div><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="label-index font-mono text-xs uppercase tracking-[0.18em] text-olive">Analysis status</p><p className="mt-3 max-w-md text-base leading-relaxed text-moss">Trace keeps each investigation visible, with a clear path back to the source report.</p></div><button type="button" onClick={() => setManualOpen(true)} className="rounded-sm bg-forest px-4 py-3 text-sm text-paper hover:bg-moss">Analyze candidate</button></div><div className="mt-7 space-y-6"><div className="border-b border-forest/10 pb-5"><div className="flex items-center justify-between"><strong className="font-normal">Stage 1</strong><Link href={`/orgs/${params.orgId}/jobs/${params.jobId}/analysis/stage-1`} className="text-sm text-forest">View →</Link></div><p className="mt-2"><StageStatus {...data.analysis.stage1} /></p></div><div className="border-b border-forest/10 pb-5"><div className="flex items-center justify-between"><strong className="font-normal">Stage 2A</strong><Link href={`/orgs/${params.orgId}/jobs/${params.jobId}/analysis/stage-2a`} className="text-sm text-forest">View →</Link></div><p className="mt-2"><StageStatus {...data.analysis.stage2a} /></p></div><div><div className="flex items-center justify-between"><strong className="font-normal">Stage 2C</strong><Link href={`/orgs/${params.orgId}/jobs/${params.jobId}/analysis/stage-2c`} className="text-sm text-forest">View →</Link></div><p className="mt-2"><StageStatus {...data.analysis.stage2c} /></p></div></div>{queueMessage && <p className="mt-5 border-l-2 border-olive pl-4 text-sm text-moss">{queueMessage}</p>}</div>
                <div><div className="flex items-end justify-between"><div><p className="label-index font-mono text-xs uppercase tracking-[0.18em] text-olive">Candidates</p><p className="mt-2 text-sm text-olive">The current evidence pipeline for this role.</p></div><Link href={`/orgs/${params.orgId}/jobs/${params.jobId}/applicants`} className="inline-flex items-center gap-2 text-sm text-forest">View all <ArrowRight className="size-4" /></Link></div><div className="mt-6 overflow-x-auto"><table className="w-full min-w-[680px] border-t border-forest/15 text-left text-sm"><thead className="font-mono text-[10px] uppercase tracking-[0.13em] text-olive"><tr><th className="py-3 font-normal">Candidate</th><th className="py-3 font-normal">Stage 1</th><th className="py-3 font-normal">Stage 2C</th><th className="py-3 font-normal">Final</th><th className="py-3 font-normal">Pipeline state</th></tr></thead><tbody className="divide-y divide-forest/10">{data.candidates.slice(0, 8).map((candidate) => <tr key={candidate.id}><td className="py-5 text-lg text-ink">{candidate.name}</td><td className="py-5 font-mono tabular-nums">{candidate.stage1Score ?? "—"}</td><td className="py-5 font-mono tabular-nums">{candidate.stage2cScore ?? "—"}</td><td className="py-5 font-mono tabular-nums text-forest">{candidate.finalScore ?? "—"}</td><td className="py-5"><CandidateProcessing candidate={candidate} /></td></tr>)}</tbody></table></div></div>
              </section>

              <section className="border-b border-forest/12 py-12"><div className="flex flex-wrap items-end justify-between gap-6"><div><p className="label-index font-mono text-xs uppercase tracking-[0.18em] text-olive">Role configuration</p><p className="mt-3 max-w-[42ch] text-base leading-relaxed text-olive">Requirements, eligibility, evidence and evaluation priorities define what this role asks Trace to investigate.</p></div><Link href={`/orgs/${params.orgId}/jobs/${params.jobId}/publish`} className="inline-flex items-center gap-2 border-b border-forest pb-2 text-sm text-forest">Edit configuration <ArrowRight className="size-4" /></Link></div></section>
            </>}
          </div>
        </main>
      </div>
      {manualOpen && data && <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest/35 p-6" role="dialog" aria-modal="true"><div className="w-full max-w-xl rounded-sm border border-forest/20 bg-paper p-7 shadow-2xl"><p className="font-mono text-xs uppercase tracking-[0.18em] text-olive">Manual analysis</p><h2 className="mt-3 text-3xl font-light tracking-[-0.04em]">Choose a candidate</h2><p className="mt-3 text-sm leading-relaxed text-moss">Start repository investigation now, even when a candidate is outside the automatic selection threshold.</p><select value={selectedApplication} onChange={(event) => setSelectedApplication(event.target.value)} className="mt-7 w-full border-b border-forest/30 bg-transparent px-1 py-3 text-base text-forest outline-none"><option value="">Select candidate</option>{data.candidates.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name} · Stage 1 {candidate.stage1Score ?? "—"} · {candidate.stage2aStatus}</option>)}</select><div className="mt-8 flex justify-end gap-3"><button type="button" onClick={() => setManualOpen(false)} className="border border-forest/25 px-4 py-3 text-sm text-olive">Cancel</button><button type="button" disabled={!selectedApplication || queueing} onClick={analyzeSelectedCandidate} className="bg-forest px-4 py-3 text-sm text-paper disabled:cursor-not-allowed disabled:opacity-40">{queueing ? "Starting…" : "Start analysis"}</button></div></div></div>}
    </div>
  );
}
