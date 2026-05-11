"use client";
import { Switch } from "@/components/ui/switch"
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useWorkspace } from "./workspace-provider";
import { Logo } from "./logo";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { useTheme } from "next-themes";
import {
  BarChart3,
  Bell,
  Brain,
  Calendar,
  ChevronLeft,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Settings,
  Users,
  Wallet,
  Zap,
  Sun,
  Moon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useTranslations, useLocale } from "next-intl";

export function AppSidebar({
  isOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
  isFocusMode = false,
}: {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isFocusMode?: boolean;
}) {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();

  function switchLocale(next: "es" | "en") {
    if (next === locale) return;
    const newPath = pathname.replace(/^\/(es|en)/, `/${next}`);
    router.push(newPath);
  }

  const { isPro, activeWorkspace, profile } = useWorkspace();
  const supabase = createClient();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notification-unread-count", activeWorkspace?.id, profile?.id],
    enabled: !!activeWorkspace?.id && !!profile?.id,
    queryFn: async () => {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("workspace_id", activeWorkspace!.id)
        .eq("user_id", profile!.id)
        .eq("is_read", false);
      return count ?? 0;
    },
    staleTime: 1000 * 30,
  });

  const NAV_ITEMS = [
    { href: "/dashboard", icon: LayoutDashboard, label: t("sidebar.dashboard") },
    { href: "/clients", icon: Users, label: t("sidebar.clientes") },
    { href: "/campaigns", icon: Zap, label: t("sidebar.campanas") },
    { href: "/planner", icon: Calendar, label: t("sidebar.planificador") },
    { href: "/ideas", icon: Brain, label: t("sidebar.ideas") },
    { href: "/content", icon: FileText, label: t("sidebar.contenido") },
    { href: "/library", icon: FolderOpen, label: t("sidebar.biblioteca") },
    { href: "/analytics", icon: BarChart3, label: t("sidebar.analisis"), proOnly: true },
  ];

  const BOTTOM_ITEMS = [
    { href: "/notifications", icon: Bell, label: t("sidebar.notifications") },
    { href: "/team", icon: Users, label: t("sidebar.equipo") },
    { href: "/billing", icon: Wallet, label: t("sidebar.billing") },
    { href: "/settings", icon: Settings, label: t("sidebar.settings") },
  ];

  return (
    <>
      {/* Backdrop para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "flex h-screen flex-col border-r border-border bg-card z-50 transition-all duration-300 ease-in-out",
          isFocusMode ? "w-0 -translate-x-full border-r-0 overflow-hidden" : isCollapsed ? "w-[72px]" : "w-64",
          "fixed top-0 bottom-0 left-0 md:sticky md:top-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header & Logo */}
        <div className={cn("flex py-3 items-center justify-center px-6", isCollapsed && "px-2 py-4")}>
          {isCollapsed ? (
            <div className="flex justify-center transition-all hover:scale-105 active:scale-95">
              <Logo size="sm" onDark={true} />
            </div>
          ) : (
            <div className="flex-1 flex justify-center py-2">
              <Logo size="md" onDark={true} />
            </div>
          )}
        </div>

        {/* Workspace Selector */}
        <div className={cn("p-4 border-b border-border", isCollapsed && "p-2 flex justify-center")}>
          <WorkspaceSwitcher collapsed={isCollapsed} />
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-3">
          <div className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;
              const locked = item.proOnly && !isPro;

              return (
                <Link
                  key={item.href}
                  id={`sidebar-${item.href.replace("/", "")}`}
                  href={locked ? "/billing" : item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    "relative flex items-center gap-3 rounded-md py-2.5 px-3 transition-all duration-150",
                    active
                      ? "bg-brand/10 text-brand"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    isCollapsed && "justify-center px-0 py-3"
                  )}
                >
                  <Icon size={active ? 18 : 16} strokeWidth={active ? 2.5 : 2} className="shrink-0" />
                  {!isCollapsed && (
                    <span className="flex-1 truncate text-sm font-medium tracking-tight">
                      {item.label}
                    </span>
                  )}
                  {locked && !isCollapsed && (
                    <span className="text-[9px] font-bold bg-brand/10 text-brand px-1.5 py-0.5 rounded-md">
                      PRO
                    </span>
                  )}
                </Link>
              );
            })}

            {BOTTOM_ITEMS.map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;
              const isNotifications = item.href === "/notifications";
              const badge = isNotifications && unreadCount > 0 ? unreadCount : 0;

              return (
                <Link
                  key={item.href}
                  id={`sidebar-${item.href.replace("/", "")}`}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    "relative flex items-center gap-3 rounded-md py-2.5 px-3 transition-all duration-150",
                    active
                      ? "bg-brand/10 text-brand"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    isCollapsed && "justify-center px-0 py-3"
                  )}
                >
                  <div className="relative shrink-0">
                    <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                    {badge > 0 && (
                      <span className={cn(
                        "absolute flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand text-[8px] font-bold text-white leading-none",
                        isCollapsed ? "-right-1 -top-1" : "-right-1.5 -top-1.5"
                      )}>
                        {badge > 9 ? "9+" : badge}
                      </span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <span className="flex-1 text-sm font-medium tracking-tight">
                      {item.label}
                    </span>
                  )}
                  {badge > 0 && !isCollapsed && (
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 bg-brand/10 text-brand rounded-md">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* System Settings (Theme & Locale) */}
        <div className={cn("px-4 pb-3 border-t border-border pt-3 space-y-3", isCollapsed && "px-2 text-center")}>
          {!isCollapsed ? (
            <div className="flex items-center justify-center gap-3 py-1.5">
              {/* Theme Switch */}
              <div className="flex items-center" title={mounted && resolvedTheme === "dark" ? "Modo Oscuro / Dark Mode" : "Modo Claro / Light Mode"}>
                <Switch
                  checked={mounted && resolvedTheme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  aria-label="Cambiar tema"
                  className="relative"
                >
                  {/* Sun icon on the left - visible when dark mode is checked */}
                  <span className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                    <Sun size={10} className={cn("transition-opacity duration-200", mounted && resolvedTheme === "dark" ? "opacity-100 text-white" : "opacity-0")} />
                  </span>

                  {/* Moon icon on the right - visible when light mode is unchecked */}
                  <span className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                    <Moon size={10} className={cn("transition-opacity duration-200", mounted && resolvedTheme !== "dark" ? "opacity-100 text-muted-foreground" : "opacity-0")} />
                  </span>
                </Switch>
              </div>

              {/* Separator */}
              <div className="h-4 w-[1px] bg-border/40" />

              {/* Language Switch */}
              <div className="flex items-center" title={locale === "es" ? "Español / Spanish" : "English"}>
                <Switch
                  checked={locale === "es"}
                  onCheckedChange={(checked) => switchLocale(checked ? "es" : "en")}
                  aria-label="Cambiar idioma"
                  className="relative"
                >
                  {/* Spanish flag - visible when ES is checked */}
                  <span className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none text-[9px]">
                    <span className={cn("transition-opacity duration-200", locale === "es" ? "opacity-100" : "opacity-0")}>🇪🇸</span>
                  </span>

                  {/* English flag - visible when EN is unchecked */}
                  <span className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none text-[9px]">
                    <span className={cn("transition-opacity duration-200", locale !== "es" ? "opacity-100" : "opacity-0")}>🇬🇧</span>
                  </span>
                </Switch>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-1">
              {/* Theme Switch */}
              <div title="Cambiar tema">
                <Switch
                  checked={mounted && resolvedTheme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  aria-label="Cambiar tema"
                  className="relative"
                >
                  <span className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                    <Sun size={10} className={cn("transition-opacity duration-200", mounted && resolvedTheme === "dark" ? "opacity-100 text-white" : "opacity-0")} />
                  </span>
                  <span className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                    <Moon size={10} className={cn("transition-opacity duration-200", mounted && resolvedTheme !== "dark" ? "opacity-100 text-muted-foreground" : "opacity-0")} />
                  </span>
                </Switch>
              </div>

              {/* Language Switch */}
              <div title="Cambiar idioma">
                <Switch
                  checked={locale === "es"}
                  onCheckedChange={(checked) => switchLocale(checked ? "es" : "en")}
                  aria-label="Cambiar idioma"
                  className="relative"
                >
                  <span className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none text-[9px]">
                    <span className={cn("transition-opacity duration-200", locale === "es" ? "opacity-100" : "opacity-0")}>🇪🇸</span>
                  </span>
                  <span className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none text-[9px]">
                    <span className={cn("transition-opacity duration-200", locale !== "es" ? "opacity-100" : "opacity-0")}>🇬🇧</span>
                  </span>
                </Switch>
              </div>
            </div>
          )}
        </div>

        {/* User Status / Upgrade Card */}
        {!isPro && !isCollapsed && (
          <div className="p-3 border-t border-border">
            <div className="rounded-2xl border border-border bg-accent/30 p-4">
              <p className="text-[11px] font-semibold text-brand mb-1" style={{ fontFamily: "var(--font-switzer), sans-serif" }}>{t("sidebar.scale_op")}</p>
              <p className="text-[11px] leading-snug text-muted-foreground mb-3" style={{ fontFamily: "var(--font-switzer), sans-serif" }}>{t("sidebar.scale_desc")}</p>
              <Link
                href="/billing"
                className="flex items-center justify-center h-8 w-full rounded-full bg-brand text-[11px] font-semibold text-white hover:bg-brand/90 transition-all"
                style={{ fontFamily: "var(--font-switzer), sans-serif" }}
              >
                {t("sidebar.get_pro")}
              </Link>
            </div>
          </div>
        )}
      </aside >
    </>
  );
}
