"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Calendar, CheckCircle2, Layers, Users, Zap, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

const PILL_ICONS = [Users, Layers, Calendar, BarChart3, CheckCircle2, Zap];

export function LandingHero() {
  const t = useTranslations("landing.hero");

  const pills = (t.raw("pills") as Array<{ label: string }>).map((p, i) => ({
    icon: PILL_ICONS[i]!,
    label: p.label,
  }));

  const stats = t.raw("stats") as Array<{ label: string; value: string }>;

  return (
    <section className="relative overflow-hidden bg-[#f5f7fa] pb-24 pt-40">
      {/* Background organic gradient — atmospheric depth */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -right-32 -top-32 h-[600px] w-[600px] rounded-full opacity-40"
          style={{ background: "radial-gradient(circle, #E1EFFF 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-40 -left-20 h-[500px] w-[500px] rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, #91e0ff 0%, transparent 70%)" }}
        />
      </div>

      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">

          {/* Badge pill */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10"
          >
            <span
              className="inline-flex items-center gap-2 rounded-full border border-[#e2e8f0] bg-white px-4 py-2 text-sm font-medium text-[#001A3D] shadow-[rgba(0,26,61,0.04)_0px_2px_8px_0px]"
              style={{ fontFamily: "var(--font-switzer), sans-serif" }}
            >
              <Sparkles size={13} className="text-[#0084FF]" />
              {t("badge")}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl text-5xl font-bold leading-[1.08] tracking-[-0.03em] text-[#001A3D] sm:text-6xl lg:text-[72px]"
            style={{ fontFamily: "var(--font-clash), var(--font-switzer), sans-serif" }}
          >
            {t("title_before")}{" "}
            <span
              className="relative inline-block"
              style={{
                background: "linear-gradient(135deg, #0084FF 0%, #3b82f6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {t("title_highlight")}
            </span>
            {t("title_after")}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 max-w-2xl text-lg leading-relaxed text-[#64748b]"
            style={{ fontFamily: "var(--font-switzer), sans-serif", letterSpacing: "-0.010em" }}
          >
            {t("subtitle")}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/login?mode=signup"
              className="inline-flex items-center gap-2 rounded-[10px] bg-[#0084FF] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[rgba(0,132,255,0.24)_0px_8px_24px_0px] transition-all hover:bg-[#0072e0] hover:shadow-[rgba(0,132,255,0.32)_0px_12px_32px_0px] active:scale-[0.98]"
              style={{ fontFamily: "var(--font-switzer), sans-serif" }}
            >
              {t("cta_primary")}
              <ArrowRight size={16} />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 rounded-[10px] border border-[#0084FF] bg-transparent px-7 py-3.5 text-[15px] font-semibold text-[#0084FF] transition-all hover:bg-[#0084FF]/5 active:scale-[0.98]"
              style={{ fontFamily: "var(--font-switzer), sans-serif" }}
            >
              {t("cta_secondary")}
            </Link>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mt-20 flex flex-wrap items-center justify-center gap-3"
          >
            {pills.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 rounded-[10px] border border-[#e2e8f0] bg-white px-4 py-2.5 shadow-[rgba(0,26,61,0.04)_0px_2px_8px_0px] transition-all hover:border-[#0084FF]/40 hover:shadow-[rgba(0,132,255,0.08)_0px_4px_16px_0px]"
              >
                <Icon size={14} className="text-[#0084FF]" />
                <span
                  className="text-[13px] font-medium text-[#001A3D]"
                  style={{ fontFamily: "var(--font-switzer), sans-serif" }}
                >
                  {label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mt-24 grid grid-cols-3 gap-8 sm:gap-16 border-t border-[#e2e8f0]/60 pt-12 w-full max-w-2xl"
          >
            {stats.map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <span
                  className="text-3xl font-bold tracking-[-0.04em] text-[#001A3D] sm:text-4xl"
                  style={{ fontFamily: "var(--font-clash), var(--font-switzer), sans-serif" }}
                >
                  {value}
                </span>
                <span
                  className="text-[13px] text-[#64748b]"
                  style={{ fontFamily: "var(--font-switzer), sans-serif" }}
                >
                  {label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
