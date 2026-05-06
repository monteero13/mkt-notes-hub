"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/logo";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

export function LandingNavbar() {
  const t = useTranslations("landing.navbar");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const NAV_LINKS = [
    { label: t("features"), href: "#features" },
    { label: t("pricing"), href: "#pricing" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll);

    const supabase = createClient();
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-20 max-w-[1200px] items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Logo size="md" onDark={false} />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              style={{ fontFamily: "var(--font-switzer), sans-serif" }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand/90 active:scale-[0.98]"
              style={{ fontFamily: "var(--font-switzer), sans-serif" }}
            >
              Inicia sesión
              <ArrowUpRight size={14} />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                style={{ fontFamily: "var(--font-switzer), sans-serif" }}
              >
                {t("login")}
              </Link>
              <Link
                href="/login?mode=signup"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand/90 active:scale-[0.98]"
                style={{ fontFamily: "var(--font-switzer), sans-serif" }}
              >
                {t("signup")}
                <ArrowUpRight size={14} />
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-[#64748b] hover:text-[#001A3D] transition-colors"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-border bg-background md:hidden shadow-elevated"
        >
          <div className="flex flex-col gap-0 px-6 py-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="py-4 text-sm font-medium text-muted-foreground border-b border-border/40 hover:text-foreground transition-colors"
                style={{ fontFamily: "var(--font-switzer), sans-serif" }}
              >
                {link.label}
              </a>
            ))}
            <div className="mt-6 flex flex-col gap-3 pb-4">
              {user ? (
                <Link
                  href="/dashboard"
                  className="py-3 text-center rounded-full bg-brand text-sm font-semibold text-white hover:bg-brand/90 transition-all"
                  style={{ fontFamily: "var(--font-switzer), sans-serif" }}
                >
                  Go to Command Center
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="py-3 text-center text-sm font-medium text-muted-foreground border border-border rounded-full hover:bg-accent transition-all"
                    style={{ fontFamily: "var(--font-switzer), sans-serif" }}
                  >
                    {t("login")}
                  </Link>
                  <Link
                    href="/login?mode=signup"
                    className="py-3 text-center rounded-full bg-brand text-sm font-semibold text-white hover:bg-brand/90 transition-all"
                    style={{ fontFamily: "var(--font-switzer), sans-serif" }}
                  >
                    {t("signup")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
