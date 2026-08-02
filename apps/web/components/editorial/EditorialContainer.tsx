import { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

type Width = "copy" | "editorial" | "story" | "wide" | "full";

interface EditorialContainerProps {
  children: ReactNode;
  className?: string;

  /**
   * Controls the reading width.
   */
  width?: Width;

  /**
   * Vertical spacing preset.
   */
  spacing?: "none" | "sm" | "md" | "lg" | "xl";

  /**
   * Render element.
   * Defaults to <section>.
   */
  as?: ElementType;
}

const widthClasses: Record<Width, string> = {
  copy: "container-copy",
  editorial: "container-editorial",
  story: "container-story",
  wide: "container-wide",
  full: "w-full",
};

const spacingClasses = {
  none: "",
  sm: "section-sm",
  md: "section-md",
  lg: "section-lg",
  xl: "section-xl",
};

export function EditorialContainer({
  children,
  className,
  width = "editorial",
  spacing = "lg",
  as: Component = "section",
}: EditorialContainerProps) {
  return (
    <Component
      className={cn(
        widthClasses[width],
        spacingClasses[spacing],
        className,
      )}
    >
      {children}
    </Component>
  );
}