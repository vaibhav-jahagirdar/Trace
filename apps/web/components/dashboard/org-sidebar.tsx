"use client";

import { useAuth } from "@/providers/auth-provider";

const GROUPS = [
  { label: undefined, items: ["Dashboard"] },
  { label: "Hiring", items: ["Jobs", "Interviews"] },
  { label: "Organization", items: ["Members", "Templates", "Settings"] },
];

export function OrgSidebar() {
  const { activeOrg } = useAuth();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-forest/12 bg-warm lg:block">
      <div className="sticky top-0 flex h-screen flex-col px-6 py-7">
        <span className="font-mono text-sm uppercase tracking-[0.18em] text-forest">Trace</span>
        <nav className="mt-10 flex-1 space-y-8" aria-label="Organization navigation">
          {GROUPS.map((group) => (
            <div key={group.label ?? "dashboard"}>
              {group.label && <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-olive/80">{group.label}</p>}
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item}><span className={`block rounded-sm px-2 py-1.5 text-sm ${item === "Dashboard" ? "bg-forest/10 text-forest" : "text-moss/70"}`}>{item}</span></li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-forest/12 pt-4">
          <p className="text-sm text-ink">{activeOrg?.orgName ?? "Organization"}</p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-olive">{activeOrg?.role ?? "Workspace"}</p>
        </div>
      </div>
    </aside>
  );
}
