"use client";

import { motion } from "framer-motion";
import { BarChart3, Brain, Calendar, FileText, FolderOpen, Layout, ListTodo, Users } from "lucide-react";
import { useTranslations } from "next-intl";

const FEATURE_ICONS = [Users, Layout, Calendar, ListTodo, Brain, FileText, FolderOpen, BarChart3];

export function LandingFeatures() {
  const t = useTranslations("landing.features");

  const items = (t.raw("items") as Array<{ title: string; description: string }>).map((item, i) => ({
    icon: FEATURE_ICONS[i]!,
    title: item.title,
    description: item.description,
  }));

  return (
    <section id="features" className="bg-[#f5f7fa] py-28">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">

        {/* Section header */}
        <div className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl space-y-4">
            <motion.p
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
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
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold leading-[1.1] tracking-[-0.03em] text-[#001A3D] sm:text-5xl"
              style={{ fontFamily: "var(--font-clash), var(--font-switzer), sans-serif" }}
            >
              {t("title_before")}{" "}
              <span className="text-[#0084FF]">{t("title_highlight")}</span>
              {t("title_after") ? ` ${t("title_after")}` : ""}
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="max-w-sm text-base leading-relaxed text-[#64748b]"
            style={{ fontFamily: "var(--font-switzer), sans-serif", letterSpacing: "-0.01em" }}
          >
            {t("subtitle")}
          </motion.p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="group flex flex-col gap-5 rounded-[24px] border border-[#e2e8f0] bg-white p-8 shadow-[rgba(0,26,61,0.04)_0px_8px_16px_0px] transition-all duration-200 hover:border-[#0084FF]/30 hover:shadow-[rgba(0,132,255,0.06)_0px_16px_40px_0px]"
              >
                {/* Icon container */}
                <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#E1EFFF]/50 transition-colors group-hover:bg-[#E1EFFF]/80">
                  <Icon size={20} className="text-[#0084FF]" />
                </div>

                <div className="space-y-2">
                  <h3
                    className="text-[15px] font-semibold text-[#001A3D]"
                    style={{ fontFamily: "var(--font-switzer), sans-serif" }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="text-[13px] leading-relaxed text-[#64748b]"
                    style={{ fontFamily: "var(--font-switzer), sans-serif" }}
                  >
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
