"use client";

import dynamic from "next/dynamic";

const StickyFeatures = dynamic(
  () => import("@/components/features/landing/sticky-features").then(mod => mod.StickyFeatures), 
  { ssr: false }
);

const ScrollReveal = dynamic(
  () => import("@/components/ui/scroll-reveal").then(mod => mod.ScrollReveal), 
  { ssr: false }
);

export function LandingClientWrapper({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <StickyFeatures />
      <ScrollReveal>{null}</ScrollReveal>
      {children}
    </>
  );
}
