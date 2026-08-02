"use client";

import { ReactNode } from "react";

import { motion, useScroll, useTransform } from "motion/react";

import { cn } from "@/lib/utils";

interface ParallaxProps {
  children: ReactNode;
  className?: string;

  /**
   * Relative movement speed.
   * Positive values move slower than scroll.
   * Negative values move opposite direction.
   */
  speed?: number;

  /**
   * Pixels of travel at speed=1.
   */
  distance?: number;
}

export function Parallax({
  children,
  className,
  speed = 0.15,
  distance = 120,
}: ParallaxProps) {
  const { scrollY } = useScroll();

  const y = useTransform(
    scrollY,
    [0, 3000],
    [0, distance * speed],
  );

  return (
    <motion.div
      style={{ y }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}