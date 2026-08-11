"use client";

import { useAuth } from "@/providers/auth-provider";
import { OrgSidebar } from "@/components/dashboard/org-sidebar";
import { ActiveJobs, DraftJobs, NeedsAttention, RecentActivity, RecentlyClosed, UpcomingInterviews } from "@/components/dashboard/org-panels";
import { EMPTY_DASHBOARD_DATA, EMPTY_SUMMARY } from "@/components/dashboard/org-mock";

const TONE: Record<string, string> = { ink: "text-ink", olive: "text-olive", conflict: "text-destructive" };

export default function OrganizationDashboardPage() {
  const { activeOrg, user } = useAuth();
  const data = EMPTY_DASHBOARD_DATA;

  return (
    <div className="flex min-h-screen w-full bg-paper">
      <OrgSidebar />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-forest/12 bg-paper/95 px-6 py-5 backdrop-blur md:px-10 lg:px-14">
          <div className="mx-auto flex max-w-6xl items-baseline justify-between gap-6">
            <span className="font-mono text-sm uppercase tracking-[0.18em] text-forest lg:hidden">Trace</span>
            <span className="label-index hidden text-olive sm:block">{activeOrg?.orgName ?? "Organization"} · Hiring overview</span>
            <span className="label-index text-forest">{user?.username ?? "Workspace"}</span>
          </div>
        </header>

        <main className="px-6 pb-32 md:px-10 lg:px-14">
          <div className="mx-auto max-w-6xl">
            <section className="border-b border-forest/10 pb-14 pt-16">
              <p className="label-index text-olive">{activeOrg?.orgName ?? "Organization"}</p>
              <div className="mt-5 flex flex-wrap items-end justify-between gap-8">
                <h1 className="display-section max-w-[20ch] text-ink">Hiring at a glance</h1>
                <div className="flex flex-wrap gap-3">
                  <button type="button" className="inline-flex items-center gap-2 rounded-sm bg-forest px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-moss">Post a job</button>
                  <button type="button" className="inline-flex items-center gap-2 rounded-sm border border-forest/30 px-4 py-3 text-sm text-forest transition-colors hover:bg-warm">Use template</button>
                  <button type="button" className="inline-flex items-center gap-2 rounded-sm border border-forest/30 px-4 py-3 text-sm text-forest transition-colors hover:bg-warm">View interviews</button>
                </div>
              </div>
              <p className="mt-8 max-w-[56ch] text-base leading-relaxed text-moss">What is happening across our hiring, and where do I need to act?</p>
              <dl className="mt-12 grid gap-6 border-t border-forest/12 pt-8 sm:grid-cols-3 lg:grid-cols-5">
                {EMPTY_SUMMARY.map((item) => <div key={item.label}><dt className="label-index text-olive">{item.label}</dt><dd className={`mt-3 font-mono text-3xl tabular-nums ${TONE[item.tone]}`}>{item.value}</dd></div>)}
              </dl>
            </section>

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
