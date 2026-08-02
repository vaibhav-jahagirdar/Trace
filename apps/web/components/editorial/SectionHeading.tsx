import { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

type HeadingSize = "hero" | "display" | "section" | "large";

interface SectionHeadingProps {
  children: ReactNode;
  className?: string;

  /**
   * Typography scale.
   */
  size?: HeadingSize;

  /**
   * HTML element.
   */
  as?: ElementType;
  style?: React.CSSProperties;
}

const sizeClasses: Record<HeadingSize, string> = {
  hero: "display-hero",
  display: "display-display",
  section: "display-section",
  large: "display-large",
};

export function SectionHeading({
  children,
  className,
  size = "section",
  as: Component = "h2",
  style
}: SectionHeadingProps) {
  return (
    <Component
      className={cn(
        sizeClasses[size],
        "max-w-[18ch] text-balance",
        className,
      )}
      style={style}
    >
      {children}
    </Component>
  );
}