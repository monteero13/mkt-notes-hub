import { LandingHero } from "@/components/features/landing/hero";
import { LandingPricing } from "@/components/features/landing/pricing";
import { LandingTestimonials } from "@/components/features/landing/testimonials";
import { LandingFAQ } from "@/components/features/landing/faq";
import { LandingNavbar } from "@/components/features/landing/navbar";
import { LandingFooter } from "@/components/features/landing/footer";
import { StickyFeatures, ScrollReveal } from "@/components/features/landing/landing-dynamic-imports";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <LandingNavbar />
      <main className="flex-1">
        <LandingHero />

        <StickyFeatures />

        <ScrollReveal direction="left" distance={100} duration={1}>
          <LandingPricing />
        </ScrollReveal>

        <ScrollReveal direction="right" distance={100} duration={1}>
          <LandingTestimonials />
        </ScrollReveal>

        <ScrollReveal direction="up" distance={100} duration={1}>
          <LandingFAQ />
        </ScrollReveal>
      </main>
      <LandingFooter />
    </div>
  );
}
