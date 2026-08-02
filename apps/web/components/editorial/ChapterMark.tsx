import { cn } from "@/lib/utils";

interface ChapterMarkProps {
  index: string;
  label: string;
  className?: string;
  tone?: "ink" | "paper";
  align?: "left" | "center";
}

export function ChapterMark({
  index,
  label,
  className,
  tone = "ink",
  align = "left",
}: ChapterMarkProps) {
  const textTone =
    tone === "paper"
      ? "text-paper/70"
      : "text-muted-foreground";

  return (
    <header
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      <div
        className={cn(
          "label-index flex items-center gap-4 uppercase tracking-[0.18em]",
          textTone,
        )}
      >
        <span className="shrink-0">
          CHAPTER {index}
        </span>

        <span
          aria-hidden
          className={cn(
            "h-px w-20",
            tone === "paper"
              ? "bg-paper/20"
              : "bg-border",
          )}
        />
      </div>

      <p
        className={cn(
          "label-index uppercase tracking-[0.22em]",
          textTone,
        )}
      >
        {label}
      </p>
    </header>
  );
}