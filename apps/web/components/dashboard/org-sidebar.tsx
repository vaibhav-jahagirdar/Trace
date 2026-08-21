"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { OrgMembership } from "@/features/auth/api/me";
import Link from "next/link";

const GROUPS = [
  { label: undefined, items: ["Dashboard"] },
  { label: "Hiring", items: ["Jobs", "Interviews"] },
  { label: "Organization", items: ["Members", "Templates", "Settings"] },
];

export function OrgSidebar({
  orgId,
  organization,
  organizations,
  onOrganizationChange,
}: {
  orgId?: string;
  organization: OrgMembership | null | undefined;
  organizations: OrgMembership[];
  onOrganizationChange: (organization: OrgMembership) => void;
}) {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-forest/12 bg-warm lg:block">
      <div className="sticky top-0 flex h-screen flex-col px-6 py-7">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-sm uppercase tracking-[0.18em] text-forest">Trace</span>
        </div>
        <OrganizationSwitcher orgId={orgId} organization={organization} organizations={organizations} onOrganizationChange={onOrganizationChange} />
        <nav className="mt-10 flex-1 space-y-8" aria-label="Organization navigation">
          {GROUPS.map((group) => (
            <div key={group.label ?? "dashboard"}>
              {group.label && <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-olive/80">{group.label}</p>}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const href = item === "Dashboard"
                    ? `/orgs/${orgId}/dashboard`
                    : item === "Jobs"
                      ? `/orgs/${orgId}/jobs`
                      : undefined;
                  return (
                    <li key={item}>
                      {href ? (
                        <Link href={href} className={`block rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-forest/10 hover:text-forest ${item === "Dashboard" ? "bg-forest/10 text-forest" : "text-moss/70"}`}>
                          {item}
                        </Link>
                      ) : (
                        <span className="block rounded-sm px-2 py-1.5 text-sm text-moss/70">{item}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-forest/12 pt-4">
          <p className="text-sm text-ink">{organization?.orgName ?? "Organization"}</p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-olive">{organization?.role ?? "Workspace"}</p>
        </div>
      </div>
    </aside>
  );
}

export function OrganizationSwitcher({
  orgId,
  organization,
  organizations,
  onOrganizationChange,
  className = "mt-7",
}: {
  orgId?: string;
  organization: OrgMembership | null | undefined;
  organizations: OrgMembership[];
  onOrganizationChange: (organization: OrgMembership) => void;
  className?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const selectedId = orgId ?? organization?.orgId;
  const selected = organizations.find((org) => org.orgId === selectedId) ?? organization;

  function choose(nextOrganization: OrgMembership) {
    onOrganizationChange(nextOrganization);
    setOpen(false);
    if (nextOrganization.orgId !== selectedId) {
      router.push(`/orgs/${nextOrganization.orgId}/dashboard`);
    }
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="group flex w-full items-center gap-3 border-y border-forest/12 py-3 text-left transition-colors hover:border-forest/30"
      >
        <span className="grid size-9 shrink-0 place-items-center bg-forest font-mono text-xs text-paper">
          {initials(selected?.orgName)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm text-ink">{selected?.orgName ?? "Choose organization"}</span>
          <span className="mt-0.5 block truncate font-mono text-[10px] uppercase tracking-[0.14em] text-olive">{selected?.role ?? "Workspace"}</span>
        </span>
        <ChevronDown className={`size-4 shrink-0 text-olive transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && organizations.length > 0 && (
        <div role="listbox" aria-label="Organizations" className="absolute inset-x-0 top-full z-30 mt-2 border border-forest/15 bg-paper p-1 shadow-[0_12px_30px_rgba(22,42,28,0.12)]">
          <p className="px-3 pb-2 pt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-olive">Switch organization</p>
          {organizations.map((org) => {
            const active = org.orgId === selectedId;
            return <button key={org.orgId} type="button" role="option" aria-selected={active} onClick={() => choose(org)} className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${active ? "bg-forest/8" : "hover:bg-warm"}`}>
              <span className={`grid size-7 shrink-0 place-items-center font-mono text-[10px] ${active ? "bg-forest text-paper" : "border border-forest/20 text-forest"}`}>{initials(org.orgName)}</span>
              <span className="min-w-0 flex-1"><span className="block truncate text-sm text-ink">{org.orgName}</span><span className="block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-olive">{org.role}</span></span>
              {active && <Check className="size-4 text-forest" />}
            </button>;
          })}
        </div>
      )}
    </div>
  );
}

function initials(name?: string) {
  return (name ?? "O").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}
