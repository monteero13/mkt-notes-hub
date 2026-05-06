"use client";

import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { useTranslations } from "next-intl";

export function LandingFooter() {
  const t = useTranslations("landing.footer");

  const LINKS = {
    [t("cat_product")]: [
      { label: t("link_features"), href: "#features" },
      { label: t("link_pricing"), href: "#pricing" },
      { label: t("link_changelog"), href: "/changelog" },
      { label: t("link_roadmap"), href: "/roadmap" },
    ],
    [t("cat_authority")]: [
      { label: t("link_company"), href: "/about" },
      { label: t("link_blog"), href: "/blog" },
      { label: t("link_careers"), href: "/careers" },
      { label: t("link_contact"), href: "mailto:hello@mktnotes.com" },
    ],
    [t("cat_governance")]: [
      { label: t("link_privacy"), href: "/privacy" },
      { label: t("link_terms"), href: "/terms" },
      { label: t("link_cookies"), href: "/cookies" },
    ],
  };

  return (
    <footer className="border-t border-[#e2e8f0]/60 bg-[#f5f7fa]">
      <div className="mx-auto max-w-[1200px] px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">

          {/* Brand column */}
          <div className="col-span-1 lg:col-span-2 space-y-5">
            <Logo onDark={false} />
            <p
              className="max-w-xs text-[13px] leading-relaxed text-[#64748b]"
              style={{ fontFamily: "var(--font-switzer), sans-serif" }}
            >
              {t("tagline")}
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([category, links]) => (
            <div key={category} className="space-y-5">
              <h4
                className="text-[13px] font-semibold text-[#001A3D]"
                style={{ fontFamily: "var(--font-switzer), sans-serif" }}
              >
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-[#64748b] transition-colors hover:text-[#001A3D]"
                      style={{ fontFamily: "var(--font-switzer), sans-serif" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-[#e2e8f0]/60 pt-8 sm:flex-row">
          <p
            className="text-[12px] text-[#94a3b8]"
            style={{ fontFamily: "var(--font-switzer), sans-serif" }}
          >
            &copy; {new Date().getFullYear()} {t("copyright")}
          </p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
            <span
              className="text-[12px] text-[#64748b]"
              style={{ fontFamily: "var(--font-switzer), sans-serif" }}
            >
              {t("status")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
