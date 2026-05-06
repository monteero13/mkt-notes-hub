"use client";

import dynamic from "next/dynamic";

export const StickyFeatures = dynamic(
  () => import("@/components/features/landing/sticky-features").then(mod => mod.StickyFeatures), 
  { ssr: false }
);

export const ScrollReveal = dynamic(
  () => import("@/components/ui/scroll-reveal").then(mod => mod.ScrollReveal), 
  { ssr: false }
);
