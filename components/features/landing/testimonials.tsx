"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";

export function LandingTestimonials() {
  const t = useTranslations("landing.testimonials");

  const items = t.raw("items") as Array<{
    name: string;
    role: string;
    avatar: string;
    content: string;
  }>;

  return (
    <section className="bg-[#f5f7fa] py-28">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto mb-16 max-w-2xl text-center space-y-4">
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
        </div>

        {/* Testimonial masonry */}
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {items.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="mb-5 break-inside-avoid rounded-[24px] border border-[#e2e8f0] bg-white p-7 shadow-[rgba(0,26,61,0.04)_0px_8px_16px_0px] transition-all hover:shadow-[rgba(0,26,61,0.08)_0px_16px_32px_0px]"
            >
              {/* Stars */}
              <div className="mb-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} size={12} className="fill-[#E1EFFF] text-[#0084FF]" />
                ))}
              </div>

              {/* Quote */}
              <p
                className="mb-6 text-[14px] leading-relaxed text-[#001A3D]"
                style={{ fontFamily: "var(--font-switzer), sans-serif" }}
              >
                &ldquo;{item.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 border-t border-[#e2e8f0]/50 pt-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E1EFFF]/60 text-[12px] font-bold text-[#0084FF]"
                  style={{ fontFamily: "var(--font-switzer), sans-serif" }}>
                  {item.avatar}
                </div>
                <div>
                  <div
                    className="text-[13px] font-semibold text-[#001A3D]"
                    style={{ fontFamily: "var(--font-switzer), sans-serif" }}
                  >
                    {item.name}
                  </div>
                  <div
                    className="text-[12px] text-[#94a3b8]"
                    style={{ fontFamily: "var(--font-switzer), sans-serif" }}
                  >
                    {item.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
