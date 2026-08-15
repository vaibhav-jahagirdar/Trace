"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { OrganizationSwitcher, OrgSidebar } from "@/components/dashboard/org-sidebar";
import {
  getOrganizationJobs,
  type JobsStatus,
  type OrganizationJobsResponse,
} from "../api/list";

const STATUS_RAIL: Array<{ key: JobsStatus; label: string }> = [
  { key: "ALL", label: "All" },
  { key: "PUBLISHED", label: "Active" },
  { key: "DRAFT", label: "Drafts" },
  { key: "PAUSED", label: "Paused" },
  { key: "CLOSED", label: "Closed" },
];

const EMPTY_DATA: OrganizationJobsResponse = {
  summary: { all: 0, active: 0, drafts: 0, paused: 0, closed: 0 },
  jobs: [],
  drafts: [],
};

function formatLabel(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function relativeDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "Recently";
  const days = Math.floor((Date.now() - date.valueOf()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function summaryCount(data: OrganizationJobsResponse, status: JobsStatus): number {
  if (status === "ALL") return data.summary.all;
  if (status === "PUBLISHED") return data.summary.active;
  if (status === "DRAFT") return data.summary.drafts;
  if (status === "PAUSED") return data.summary.paused;
  return data.summary.closed;
}

export default function OrganizationJobsPage() {
  const { activeOrg, organizations, setActiveOrg, user } = useAuth();
  const params = useParams<{ orgId: string }>();
  const displayedOrg = organizations.find((org) => org.orgId === params.orgId) ?? activeOrg;
  const [status, setStatus] = useState<JobsStatus>("PUBLISHED");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [sort, setSort] = useState<"UPDATED" | "CREATED" | "TITLE">("UPDATED");
  const [data, setData] = useState<OrganizationJobsResponse>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getOrganizationJobs(params.orgId, { status, search, department, role, workMode, employmentType, sort })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setError("We couldn't load the roles right now.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params.orgId, status, search, department, role, workMode, employmentType, sort]);

  const departments = useMemo(
    () => Array.from(new Set(data.jobs.map((job) => job.department).filter(Boolean) as string[])).sort(),
    [data.jobs],
  );
  const roles = useMemo(
    () => Array.from(new Set(data.jobs.map((job) => job.role).filter(Boolean) as string[])).sort(),
    [data.jobs],
  );

  return (
    <div className="flex min-h-screen w-full bg-paper text-ink">
      <OrgSidebar
        orgId={params.orgId}
        organization={displayedOrg}
        organizations={organizations}
        onOrganizationChange={setActiveOrg}
      />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-forest/12 bg-paper/95 px-6 py-5 backdrop-blur md:px-10 lg:px-14">
          <div className="mx-auto flex max-w-6xl items-baseline justify-between gap-6">
            <span className="font-mono text-sm uppercase tracking-[0.18em] text-forest lg:hidden">Trace</span>
            <span className="label-index hidden font-mono text-sm uppercase tracking-[0.18em] text-olive sm:block">
              {displayedOrg?.orgName ?? "Organization"} · ROLES
            </span>
            <div className="ml-auto flex items-center gap-4">
              <div className="lg:hidden">
                <OrganizationSwitcher
                  className="mt-0"
                  orgId={params.orgId}
                  organization={displayedOrg}
                  organizations={organizations}
                  onOrganizationChange={setActiveOrg}
                />
              </div>
              <span className="label-index text-forest">{user?.username ?? "Workspace"}</span>
            </div>
          </div>
        </header>

        <main className="px-6 pb-28 md:px-10 lg:px-14">
          <div className="mx-auto max-w-6xl">
            <section className="border-b border-forest/10 pb-10 pt-14">
              <div className="flex flex-wrap items-end justify-between gap-8">
                <div>
                  <p className="label-index font-mono text-sm uppercase tracking-[0.18em] text-forest">Jobs</p>
                  <h1 className="mt-4 max-w-[18ch] font-sans text-5xl font-light leading-[0.95] tracking-[-0.05em] text-ink md:text-6xl">
                    The roles you&apos;re hiring for.
                  </h1>
                  <p className="mt-5 font-mono text-xs uppercase tracking-[0.14em] text-olive">
                    {data.summary.active} active roles · {data.summary.drafts} drafts · {data.summary.paused} paused · {data.summary.all} total
                  </p>
                </div>
                <Link href={`/orgs/${params.orgId}/jobs/create`} className="inline-flex items-center gap-2 rounded-sm bg-forest px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-moss">
                  <span aria-hidden>+</span> Post a job
                </Link>
              </div>
            </section>

            <nav className="flex overflow-x-auto border-b border-forest/12" aria-label="Job status">
              {STATUS_RAIL.map((item) => {
                const selected = status === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setStatus(item.key)}
                    className={`min-w-[92px] border-b-2 px-2 pb-4 pt-7 text-left transition-colors ${selected ? "border-forest text-forest" : "border-transparent text-olive hover:text-forest"}`}
                  >
                    <span className="block font-mono text-[11px] uppercase tracking-[0.15em]">{item.label}</span>
                    <span className="mt-2 block font-mono text-2xl tabular-nums">{summaryCount(data, item.key)}</span>
                  </button>
                );
              })}
            </nav>

            <section className="border-b border-forest/12 py-6" aria-label="Job filters">
              <div className="grid gap-3 lg:grid-cols-[minmax(14rem,1fr)_auto_auto_auto_auto]">
                <label className="relative block">
                  <span className="sr-only">Search roles</span>
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-olive" />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search roles" className="w-full border-b border-forest/25 bg-transparent py-3 pl-9 pr-3 text-sm outline-none placeholder:text-olive/70 focus:border-forest" />
                </label>
                <select value={department} onChange={(event) => setDepartment(event.target.value)} className="border-b border-forest/25 bg-transparent px-1 py-3 text-sm text-forest outline-none">
                  <option value="">Department</option>
                  {departments.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <select value={role} onChange={(event) => setRole(event.target.value)} className="border-b border-forest/25 bg-transparent px-1 py-3 text-sm text-forest outline-none">
                  <option value="">Role</option>
                  {roles.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <select value={workMode} onChange={(event) => setWorkMode(event.target.value)} className="border-b border-forest/25 bg-transparent px-1 py-3 text-sm text-forest outline-none">
                  <option value="">Work mode</option>
                  <option value="REMOTE">Remote</option><option value="HYBRID">Hybrid</option><option value="ONSITE">On-site</option>
                </select>
                <select value={employmentType} onChange={(event) => setEmploymentType(event.target.value)} className="border-b border-forest/25 bg-transparent px-1 py-3 text-sm text-forest outline-none">
                  <option value="">Employment</option>
                  <option value="FULL_TIME">Full-time</option><option value="PART_TIME">Part-time</option><option value="CONTRACT">Contract</option><option value="INTERNSHIP">Internship</option>
                </select>
                <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="border-b border-forest/25 bg-transparent px-1 py-3 text-sm text-forest outline-none">
                  <option value="UPDATED">Sort: Recent</option><option value="CREATED">Sort: Created</option><option value="TITLE">Sort: A–Z</option>
                </select>
              </div>
            </section>

            {error && <p className="border-b border-destructive/20 py-8 text-sm text-destructive">{error}</p>}
            {loading && <p className="py-14 font-mono text-xs uppercase tracking-[0.15em] text-olive">Loading roles…</p>}
            {!loading && !error && data.jobs.length === 0 && status !== "DRAFT" && (
              <section className="border-b border-forest/12 py-20">
                <p className="label-index font-mono text-xs uppercase tracking-[0.18em] text-olive">Jobs</p>
                <h2 className="mt-5 max-w-[15ch] font-sans text-4xl font-light leading-tight">Nothing hiring yet.</h2>
                <p className="mt-4 max-w-[42ch] text-base leading-relaxed text-olive">The next role starts with a clearer definition of who you&apos;re actually looking for.</p>
                <Link href={`/orgs/${params.orgId}/jobs/create`} className="mt-8 inline-flex items-center gap-3 border-b border-forest pb-2 text-sm text-forest">Post your first job <ArrowRight className="size-4" /></Link>
              </section>
            )}
            {!loading && !error && data.jobs.length > 0 && (
              <section aria-label="Roles" className="divide-y divide-forest/12">
                {data.jobs.map((job) => (
                  <Link key={job.id} href={`/orgs/${params.orgId}/jobs/${job.id}`} className="group block py-8 transition-colors hover:bg-warm/50 md:px-3">
                    <div className="flex flex-wrap items-start justify-between gap-6">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-2xl font-light tracking-[-0.025em] text-ink">{job.title}</h2>
                          <span className={`font-mono text-[10px] uppercase tracking-[0.15em] ${job.status === "PUBLISHED" ? "text-olive" : job.status === "PAUSED" ? "text-destructive" : "text-moss"}`}>{formatLabel(job.status)}</span>
                        </div>
                        <p className="mt-2 text-sm text-olive">{job.department ?? job.role ?? "Role"} · {formatLabel(job.employmentType)} · {formatLabel(job.workMode)} · {job.openPositions} {job.openPositions === 1 ? "opening" : "openings"}</p>
                        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-olive/80">Created {relativeDate(job.createdAt)} · Updated {relativeDate(job.updatedAt)}</p>
                      </div>
                      <span className="inline-flex items-center gap-2 text-sm text-forest opacity-80 transition-opacity group-hover:opacity-100">View role <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
                    </div>
                    <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3 border-t border-forest/10 pt-5 font-mono text-xs text-moss">
                      <span><strong className="text-ink">{job.kpis.applications}</strong> applications</span>
                      <span><strong className="text-ink">{job.kpis.eligible}</strong> eligible</span>
                      <span><strong className="text-forest">{job.kpis.evidenceReviewed}</strong> evidence reviewed</span>
                      <span><strong className="text-ink">{job.kpis.shortlisted}</strong> shortlisted</span>
                      <span><strong className="text-ink">{job.kpis.interviewing}</strong> interviewing</span>
                    </div>
                  </Link>
                ))}
              </section>
            )}

            {status === "DRAFT" && !loading && data.drafts.length > 0 && (
              <section className="border-t border-forest/12 pt-10">
                <p className="label-index font-mono text-xs uppercase tracking-[0.18em] text-olive">Unfinished setup</p>
                <div className="mt-4 divide-y divide-forest/12">
                  {data.drafts.map((draft) => (
                    <Link key={draft.id} href={`/orgs/${params.orgId}/jobs/create?draft=${draft.id}`} className="flex flex-wrap items-center justify-between gap-5 py-6 hover:bg-warm/50 md:px-3">
                      <div><h2 className="text-xl font-light">{draft.title}</h2><p className="mt-2 font-mono text-xs uppercase tracking-[0.14em] text-olive">Step {draft.currentStep} of 6 · Updated {relativeDate(draft.updatedAt)}</p></div>
                      <span className="inline-flex items-center gap-2 text-sm text-forest">Continue setup <ArrowRight className="size-4" /></span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
