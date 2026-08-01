"use client";

import { QueryProvider } from "./query-provider";
import { TraceThemeProvider } from "./theme-provider";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <TraceThemeProvider>
        <TooltipProvider delayDuration={150}>
          {children}
          <Toaster
            richColors
            position="bottom-right"
            closeButton
          />
        </TooltipProvider>
      </TraceThemeProvider>
    </QueryProvider>
  );
}