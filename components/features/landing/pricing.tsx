"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const PLAN_PRICES = [
  { monthly: 0, yearly: 0, highlighted: false, href: "/login?mode=signup" },
  { monthly: 5, yearly: 49, highlighted: true, href: "/login?mode=signup&plan=pro" },
  { monthly: null, yearly: null, highlighted: false, href: "mailto:sales@mktnotes.com" },
];

export function LandingPricing() {
  const t = useTranslations("landing.pricing");
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const plans = (t.raw("plans") as Array<{
    name: string;
    description: string;
    cta: string;
    badge?: string;
    features: string[];
  }>).map((plan, i) => ({
    ...plan,
    ...PLAN_PRICES[i]!,
  }));

  return (
    <section id="pricing" className="bg-white py-28">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">

        {/* Section header */}
        <div className="mx-auto mb-16 max-w-2xl text-center space-y-5">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-[#0084FF]"
            style={{ fontFamily: "var(--font-switzer), sans-serif" }}
          >
            {t("label")}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="text-4xl font-bold leading-[1.1] tracking-[-0.03em] text-[#001A3D] sm:text-5xl"
            style={{ fontFamily: "var(--font-clash), var(--font-switzer), sans-serif" }}
          >
            {t("title_before")}{" "}
            <span className="text-[#0084FF]">{t("title_highlight")}</span>{" "}
            {t("title_after")}
          </motion.h2>

          {/* Billing toggle */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.16 }}
            className="mt-8 inline-flex items-center rounded-full border border-[#e2e8f0] bg-[#f5f7fa] p-1"
          >
            {(["monthly", "yearly"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={cn(
                  "rounded-full px-6 py-2 text-[13px] font-medium transition-all",
                  billing === b
                    ? "bg-white text-[#001A3D] shadow-[rgba(0,26,61,0.08)_0px_2px_8px_0px]"
                    : "text-[#64748b] hover:text-[#001A3D]"
                )}
                style={{ fontFamily: "var(--font-switzer), sans-serif" }}
              >
                {b === "yearly" ? t("toggle_yearly") : t("toggle_monthly")}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className={cn(
                "relative flex flex-col rounded-[24px] p-8 transition-all",
                plan.highlighted
                  ? "bg-[#001A3D] shadow-[rgba(0,26,61,0.28)_0px_24px_48px_0px]"
                  : "border border-[#e2e8f0] bg-white shadow-[rgba(0,26,61,0.04)_0px_8px_16px_0px]"
              )}
            >
              {/* Plan badge */}
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#E1EFFF] px-4 py-1 text-[12px] font-semibold text-[#001A3D]"
                  style={{ fontFamily: "var(--font-switzer), sans-serif" }}>
                  {plan.badge}
                </span>
              )}

              {/* Plan header */}
              <div className="mb-6 space-y-1">
                <h3
                  className={cn("text-[13px] font-semibold uppercase tracking-widest", plan.highlighted ? "text-[#E1EFFF]" : "text-[#64748b]")}
                  style={{ fontFamily: "var(--font-switzer), sans-serif" }}
                >
                  {plan.name}
                </h3>
                <p
                  className={cn("text-[14px] leading-snug", plan.highlighted ? "text-white/60" : "text-[#64748b]")}
                  style={{ fontFamily: "var(--font-switzer), sans-serif" }}
                >
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-8">
                {plan.monthly === null ? (
                  <div
                    className={cn("text-5xl font-bold tracking-[-0.04em]", plan.highlighted ? "text-white" : "text-[#001A3D]")}
                    style={{ fontFamily: "var(--font-clash), var(--font-switzer), sans-serif" }}
                  >
                    {t("custom")}
                  </div>
                ) : (
                  <div className="flex items-end gap-2">
                    <span
                      className={cn("text-5xl font-bold tracking-[-0.04em]", plan.highlighted ? "text-white" : "text-[#001A3D]")}
                      style={{ fontFamily: "var(--font-clash), var(--font-switzer), sans-serif" }}
                    >
                      {billing === "monthly" ? plan.monthly : plan.yearly}€
                    </span>
                    <span
                      className={cn("mb-2 text-[13px]", plan.highlighted ? "text-white/40" : "text-[#94a3b8]")}
                      style={{ fontFamily: "var(--font-switzer), sans-serif" }}
                    >
                      {billing === "yearly" ? t("per_year") : t("per_month")}
                    </span>
                  </div>
                )}
              </div>

              {/* Feature list */}
              <ul className="mb-8 flex flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle2 size={14} className={plan.highlighted ? "text-[#E1EFFF] shrink-0" : "text-[#0084FF] shrink-0"} />
                    <span
                      className={cn("text-[13px]", plan.highlighted ? "text-white/70" : "text-[#001A3D]")}
                      style={{ fontFamily: "var(--font-switzer), sans-serif" }}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="mt-auto">
                <Link
                  href={plan.href}
                  className={cn(
                    "block w-full rounded-[10px] py-3 text-center text-[14px] font-semibold transition-all hover:opacity-90 active:scale-[0.98]",
                    plan.highlighted
                      ? "bg-[#E1EFFF] text-[#001A3D] shadow-[rgba(225,239,255,0.3)_0px_8px_24px_0px]"
                      : "border border-[#0084FF] bg-transparent text-[#0084FF] hover:bg-[#0084FF]/5"
                  )}
                  style={{ fontFamily: "var(--font-switzer), sans-serif" }}
                >
                  {plan.cta}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
