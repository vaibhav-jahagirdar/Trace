import { cn } from "@/lib/utils";

interface EditorialRuleProps {
  className?: string;

  /**
   * Rule width.
   */
  width?: "xs" | "sm" | "md" | "lg" | "full";

  /**
   * Rule tone.
   */
  tone?: "default" | "paper" | "muted";

  /**
   * Horizontal alignment.
   */
  align?: "left" | "center" | "right";
}

const widthClasses = {
  xs: "w-12",
  sm: "w-20",
  md: "w-32",
  lg: "w-48",
  full: "w-full",
};

const toneClasses = {
  default: "bg-border",
  paper: "bg-paper/20",
  muted: "bg-muted-foreground/25",
};

const alignClasses = {
  left: "",
  center: "mx-auto",
  right: "ml-auto",
};

export function EditorialRule({
  className,
  width = "sm",
  tone = "default",
  align = "left",
}: EditorialRuleProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "h-px shrink-0",
        widthClasses[width],
        toneClasses[tone],
        alignClasses[align],
        className,
      )}
    />
  );
}