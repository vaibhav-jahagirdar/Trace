import { cn } from "@/lib/utils";

export function AccessAction({ label = "Request access", tone = "ink" }: { label?: string; tone?: "ink" | "paper" }) {
  return <a href="mailto:hello@trace.eng?subject=Trace%20access" className={cn("inline-flex items-center gap-3 rounded-sm px-5 py-3 text-sm font-medium transition-colors", tone === "ink" ? "bg-forest text-paper hover:bg-moss" : "border border-paper/25 text-paper hover:bg-paper hover:text-forest")}>{label}<span aria-hidden>→</span></a>;
}
