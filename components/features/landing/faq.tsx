"use client";

import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslations } from "next-intl";

export function LandingFAQ() {
  const t = useTranslations("landing.faq");

  const items = t.raw("items") as Array<{ question: string; answer: string }>;

  return (
    <section id="faq" className="bg-white py-28">
      <div className="mx-auto max-w-[720px] px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-14 text-center space-y-4">
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
            <span className="text-[#0084FF]">{t("title_highlight")}</span>
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.12 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {items.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border-b border-[#e2e8f0]/60"
              >
                <AccordionTrigger
                  className="py-5 text-left text-[15px] font-semibold text-[#001A3D] hover:no-underline hover:text-[#0084FF] transition-colors"
                  style={{ fontFamily: "var(--font-switzer), sans-serif" }}
                >
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent
                  className="pb-6 text-[14px] leading-relaxed text-[#64748b]"
                  style={{ fontFamily: "var(--font-switzer), sans-serif" }}
                >
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
