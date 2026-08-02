import { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ParagraphSize = "sm" | "md" | "lg";

interface EditorialParagraphProps {
  children: ReactNode;
  className?: string;

  /**
   * Typography size.
   */
  size?: ParagraphSize;

  /**
   * Reading width.
   */
  width?: "sm" | "md" | "lg" | "full";

  /**
   * Render element.
   */
  as?: ElementType;
}

const sizeClasses: Record<ParagraphSize, string> = {
  sm: "text-base leading-7",
  md: "body-editorial",
  lg: "text-xl leading-9",
};

const widthClasses = {
  sm: "max-w-[42ch]",
  md: "max-w-[54ch]",
  lg: "max-w-[66ch]",
  full: "max-w-none",
};

export function EditorialParagraph({
  children,
  className,
  size = "md",
  width = "sm",
  as: Component = "p",
}: EditorialParagraphProps) {
  return (
    <Component
      className={cn(
        sizeClasses[size],
        widthClasses[width],
        "text-pretty text-muted-foreground",
        className,
      )}
    >
      {children}
    </Component>
  );
}