// apps/web/app/(protected)/create-org/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRightIcon, Building2Icon, UserPlusIcon } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { CreateOrgForm } from "@/features/organizations/forms/CreateOrgForm";

export default function CreateOrganizationPage() {
  const { organizations, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && organizations.length > 0) {
      router.replace(`/orgs/${organizations[0].orgId}/dashboard`);
    }
  }, [isLoading, isAuthenticated, organizations, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-paper">
        <span className="font-mono text-sm text-olive">Loading…</span>
      </div>
    );
  }

  if (!showForm) {
    return (
      <main className="min-h-svh bg-paper text-ink">
        <div className="grid min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(32rem,0.82fr)]">
          <aside className="relative hidden overflow-hidden bg-moss px-10 py-10 text-paper lg:flex lg:flex-col xl:px-16 xl:py-14">
            <div className="pointer-events-none absolute -left-24 top-32 size-[28rem] rounded-full border border-paper/5" />
            <div className="pointer-events-none absolute -bottom-64 -right-32 size-[38rem] rounded-full border border-paper/5" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_18%,oklch(0.65_0.04_145_/_0.18),transparent_35%),linear-gradient(135deg,transparent_30%,oklch(0.17_0.03_155_/_0.5))]" />

            <Link
              href="/"
              className="relative z-10 inline-flex w-fit items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.25em] text-paper/85 transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-paper"
            >
              <span className="grid size-7 place-items-center border border-paper/30 text-sm tracking-normal">
                T
              </span>
              Trace
            </Link>

            <div className="relative z-10 my-auto max-w-xl py-24">
              <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-sage/80">
                Onboarding
              </p>
              <h1 className="mt-7 font-heading text-6xl font-extrabold leading-[0.9] tracking-[-0.06em] xl:text-7xl">
                You’re
                <br />
                <span className="font-serif font-semibold italic text-sage">
                  in.
                </span>
              </h1>
              <blockquote className="mt-10 border-l-2 border-paper/20 pl-6 text-lg leading-relaxed text-paper/75">
                <p>
                  Now let’s anchor your work to an organization. Every hire,
                  every evaluation, stays grounded in shared standards.
                </p>
              </blockquote>
            </div>

            <div className="relative z-10 border-t border-paper/15 pt-6">
              <p className="max-w-xs text-sm leading-relaxed text-paper/55">
                If your team already uses Trace, ask your admin to invite you.
                Otherwise, create your own.
              </p>
            </div>
          </aside>

          <section className="relative flex min-h-svh flex-col px-6 py-6 sm:px-10 sm:py-10 lg:px-12 xl:px-20">
            <header className="flex items-center justify-between lg:hidden">
              <Link
                href="/"
                className="inline-flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.25em] text-primary"
              >
                <span className="grid size-7 place-items-center border border-primary/40 text-sm tracking-normal">
                  T
                </span>
                Trace
              </Link>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-olive">
                01 / Onboarding
              </span>
            </header>

            <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-14 lg:py-10">
              <div className="mb-12">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                    01 / Onboarding
                  </span>
                  <span className="h-px flex-1 bg-rule" />
                </div>

                <h2 className="mt-6 font-heading text-5xl font-extrabold leading-[0.95] tracking-[-0.05em] sm:text-6xl">
                  Let’s get
                  <br />
                  <span className="font-serif font-semibold italic text-primary">
                    you set up.
                  </span>
                </h2>

                <p className="mt-5 max-w-[40ch] text-base leading-relaxed text-olive">
                  Choose how you want to start with Trace. You can always join
                  additional organizations later.
                </p>
              </div>

              <div className="space-y-4">
                <div className="group border border-rule bg-paper p-6 transition-colors hover:border-primary/30">
                  <div className="flex items-start gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-rule bg-warm">
                      <UserPlusIcon className="size-5 text-olive" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-heading text-lg font-bold leading-tight text-ink">
                        Join an existing organization
                      </h3>

                      <p className="mt-2 text-sm leading-relaxed text-olive">
                        If your colleagues are already using Trace, ask your
                        organization admin to send you an invitation. You’ll be
                        added to their workspace with the right role and
                        permissions.
                      </p>

                      <p className="mt-3 text-xs font-medium uppercase tracking-wider text-olive/60">
                        No action needed on this page — reach out to your admin
                        directly.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowForm(true)}
                  className="group w-full border border-primary/20 bg-warm p-6 text-left transition-all duration-300 hover:border-primary/40 hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/5 transition-colors group-hover:bg-primary/10">
                      <Building2Icon className="size-5 text-primary" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-heading text-lg font-bold leading-tight text-ink">
                        Create your own organization
                      </h3>

                      <p className="mt-2 text-sm leading-relaxed text-olive">
                        Start fresh and set the standards yourself. Define your
                        team, roles, evidence criteria, and evaluation
                        priorities — all within your own Trace workspace.
                      </p>

                      <div className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-primary transition-transform group-hover:translate-x-1">
                        <span>Get started</span>
                        <ArrowRightIcon className="size-4" />
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <footer className="flex items-center justify-between gap-4 border-t border-rule pt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-olive">
              <span>Evidence-first hiring</span>
              <span className="hidden sm:inline">Private by design</span>
            </footer>
          </section>
        </div>
      </main>
    );
  }

  return <CreateOrgForm />;
}