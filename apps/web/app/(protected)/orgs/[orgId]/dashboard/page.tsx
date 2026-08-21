"use client";

import { useAuth } from "@/providers/auth-provider";
import { useParams } from "next/navigation";
import { OrganizationSwitcher, OrgSidebar } from "@/components/dashboard/org-sidebar";
import { ActiveJobs, DraftJobs, NeedsAttention, RecentActivity, RecentlyClosed, UpcomingInterviews } from "@/components/dashboard/org-panels";
import { EMPTY_DASHBOARD_DATA } from "@/components/dashboard/org-mock";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getOrganizationDashboard, type OrganizationDashboardResponse } from "@/features/dashboard/api/organization-dashboard";

const TONE: Record<string, string> = { ink: "text-ink", olive: "text-olive", conflict: "text-destructive" };

export default function OrganizationDashboardPage() {
  const { activeOrg, organizations, setActiveOrg, user } = useAuth();
  const params = useParams<{ orgId: string }>();
  const routeOrg = organizations.find((org) => org.orgId === params.orgId);
  const displayedOrg = routeOrg ?? activeOrg;
  const [data, setData] = useState<OrganizationDashboardResponse>({
    summary: { activeJobs: 0, drafts: 0, applications: 0, needsAttention: 0, upcomingInterviews: 0 },
    ...EMPTY_DASHBOARD_DATA,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const orgId = displayedOrg?.orgId ?? params.orgId;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getOrganizationDashboard(params.orgId)
      .then((result) => { if (!cancelled) setData(result); })
      .catch(() => { if (!cancelled) setError("We couldn't load the hiring overview."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [params.orgId]);

  const summary = [
    { value: data.summary.activeJobs, label: "active jobs", tone: "ink" },
    { value: data.summary.drafts, label: "drafts", tone: "olive" },
    { value: data.summary.applications, label: "applications", tone: "olive" },
    { value: data.summary.needsAttention, label: "need attention", tone: "conflict" },
    { value: data.summary.upcomingInterviews, label: "upcoming interviews", tone: "ink" },
  ];

  return (
    <div className="flex min-h-screen w-full bg-paper">
      <OrgSidebar orgId={params.orgId} organization={displayedOrg} organizations={organizations} onOrganizationChange={setActiveOrg} />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-forest/12 bg-paper/95 px-6 py-5 backdrop-blur md:px-10 lg:px-14">
          <div className="mx-auto flex max-w-6xl items-baseline justify-between gap-6">
            <span className="font-mono text-sm uppercase tracking-[0.18em] text-forest lg:hidden">Trace</span>
            <span className="label-index text-sm uppercase hidden tracking-[0.18em] font-mono text-olive sm:block">{displayedOrg?.orgName ?? "Organization"} · HIRING OVERVIEW</span>
            <div className="ml-auto flex items-center gap-4">
              <div className="lg:hidden"><OrganizationSwitcher className="mt-0" orgId={params.orgId} organization={displayedOrg} organizations={organizations} onOrganizationChange={setActiveOrg} /></div>
              <span className="label-index text-forest">{user?.username ?? "Workspace"}</span>
            </div>
          </div>
        </header>

        <main className="px-6 pb-32 md:px-10 lg:px-14">
          <div className="mx-auto max-w-6xl">
            <section className="border-b border-forest/10 pb-14 pt-16">
              <p className="label-index font-mono uppercase text-sm tracking-[0.18em] text-forest">{displayedOrg?.orgName ?? "Organization"}</p>
              <div className="mt-5 flex flex-wrap items-end justify-between gap-8">
                <h1 className="display-section font-sans max-w-[20ch] text-ink">Hiring at a glance</h1>
                <div className="flex w-full flex-wrap gap-3 lg:w-auto">
                  <Link
                    href={`/orgs/${orgId}/jobs/create`}
                    className="inline-flex items-center gap-2 rounded-sm bg-forest px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-moss"
                  >
                    Post a job
                  </Link>
                  <button type="button" className="inline-flex items-center gap-2 rounded-sm border border-forest/30 px-4 py-3 text-sm text-forest transition-colors hover:bg-warm">Use template</button>
                  <button type="button" className="inline-flex items-center gap-2 rounded-sm border border-forest/30 px-4 py-3 text-sm text-forest transition-colors hover:bg-warm">View interviews</button>
                </div>
              </div>
              <p className="mt-8 max-w-[56ch] text-base leading-relaxed text-moss">What is happening across our hiring, and where do I need to act?</p>
              <dl className="mt-12 grid gap-6 border-t border-forest/12 pt-8 sm:grid-cols-3 lg:grid-cols-5">
                {summary.map((item) => <div key={item.label}><dt className="label-index text-olive">{item.label}</dt><dd className={`mt-3 font-mono text-3xl tabular-nums ${TONE[item.tone]}`}>{item.value}</dd></div>)}
              </dl>
            </section>

            {error && <p className="mt-8 border border-destructive/20 bg-destructive/5 p-5 text-sm text-destructive">{error}</p>}
            {loading && <p className="mt-8 font-mono text-xs uppercase tracking-[0.16em] text-olive">Loading hiring activity…</p>}
            <div className="mt-20"><ActiveJobs jobs={data.activeJobs} /></div>
            <div className="mt-24"><NeedsAttention items={data.attention} /></div>
            <div className="mt-24 grid gap-16 lg:grid-cols-[1fr_1fr] lg:gap-20"><UpcomingInterviews groups={data.interviews} /><RecentActivity items={data.activity} /></div>
            <div className="mt-24"><DraftJobs drafts={data.drafts} /></div>
            <div className="mt-24"><RecentlyClosed jobs={data.recentlyClosed} /></div>

            <section className="mt-28 border-t border-forest/12 pt-10"><div className="grid gap-10 md:grid-cols-2"><p className="body-editorial max-w-[34ch] text-ink">This screen orchestrates hiring across the organization.</p><p className="body-editorial max-w-[34ch] text-olive">Each role decides who deserves your interview time.</p></div></section>
          </div>
        </main>
      </div>
    </div>
  );
}
