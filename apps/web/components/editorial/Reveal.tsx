"use client";

import { motion, Variants } from "motion/react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

const variants: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
    filter: "blur(6px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
  amount?: number;
  /** HTML tag to render as, e.g. "h1", "div", "section" – default is "div" */
  tag?: keyof HTMLElementTagNameMap;
}

export function Reveal({
  children,
  className,
  delay = 0,
  once = true,
  amount = 0.25,
  tag = "div",
}: RevealProps) {
  const MotionComponent = motion(tag);

  return (
    <MotionComponent
      className={cn(className)}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </MotionComponent>
  );
}