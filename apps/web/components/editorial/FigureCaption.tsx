import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface FigureCaptionProps {
  id: string;
  children: ReactNode;
  className?: string;
  tone?: "ink" | "paper";
}

export function FigureCaption({
  id,
  children,
  className,
  tone = "ink",
}: FigureCaptionProps) {
  return (
    <figcaption
      className={cn(
        "mt-5 flex items-start gap-4 text-sm tracking-[0.08em]",
        tone === "paper"
          ? "text-paper/60"
          : "text-muted-foreground",
        className,
      )}
    >
      <span className="label-index shrink-0 uppercase">
        {id}
      </span>

      <span
        aria-hidden
        className={cn(
          "mt-[0.7em] h-px w-10 shrink-0",
          tone === "paper"
            ? "bg-paper/20"
            : "bg-border",
        )}
      />

      <p className="max-w-[44ch] leading-relaxed tracking-normal">
        {children}
      </p>
    </figcaption>
  );
}