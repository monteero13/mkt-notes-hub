'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Target,
  Lightbulb,
  BookOpen,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Crown,
  Globe,
  Sun,
  Moon,
  LogOut,
  User
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DeveloperSignature } from "./DeveloperSignature";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { toast } from "sonner";

const navItems = [
  { id: "dashboard", to: "/", icon: LayoutDashboard },
  { id: "planificador", to: "/planificador", icon: Calendar },
  { id: "contenido", to: "/contenido", icon: FileText },
  { id: "campanas", to: "/campanas", icon: BarChart3, isPro: true },
  { id: "objetivos", to: "/objetivos", icon: Target },
  { id: "ideas", to: "/ideas", icon: Lightbulb },
  { id: "biblioteca", to: "/biblioteca", icon: BookOpen },
  { id: "equipo", to: "/equipo", icon: Users, isPro: true },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const supabase = createClient();

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);

    const savedTheme = localStorage.getItem('mkt-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }

    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
    toast.success('Sesión cerrada correctamente');
  };

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('mkt-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('mkt-theme', 'light');
    }
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(nextLang);
  };

  if (!mounted) {
    return (
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden md:flex flex-col transition-all duration-300",
          "bg-sidebar/95 backdrop-blur-xl border-r border-border/50 shadow-2xl",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className={cn("flex h-20 items-center px-6", collapsed ? "justify-center px-0" : "justify-between")}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "relative flex shrink-0 items-center justify-center transition-all duration-300",
              collapsed ? "h-11 w-11 mx-auto" : "h-14 w-14"
            )}>
              <div className="h-full w-full bg-muted rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 hidden md:flex flex-col transition-all duration-300",
        "bg-sidebar/95 backdrop-blur-xl border-r border-border/50 shadow-2xl",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 z-40 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background shadow-md text-muted-foreground hover:text-foreground transition-all hover:scale-110"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* Logo */}
      <div className={cn("flex h-20 items-center px-6", collapsed ? "justify-center px-0" : "justify-between")}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={cn(
              "relative flex shrink-0 items-center justify-center transition-all duration-300",
              collapsed ? "h-11 w-11 mx-auto" : "h-14 w-14"
            )}>
              <img
                src={isDark ? "/dark_logo.png" : "/logo.png"}
                alt="mkt.notes"
                className={cn(
                  "h-full w-full object-contain transition-all duration-500",
                  !isDark && "mix-blend-multiply"
                )}
              />
            </div>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-heading text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                mkt.notes
              </span>
              <span className="text-[9px] font-bold text-primary tracking-[0.2em] uppercase opacity-80 -mt-1">Marketing Hub</span>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="tour-sidebar-nav flex-1 space-y-1 px-3 py-6 overflow-y-auto overflow-x-hidden scrollbar-none">
        {navItems.map((item) => {
          const isActive =
            item.to === "/"
              ? pathname === "/"
              : pathname.startsWith(item.to);

          return (
            <Link
              key={item.to}
              href={item.to}
              className={cn(
                `tour-item-${item.id}`,
                "group relative flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
                isActive
                   ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(94,129,244,0.1)]"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground",
                collapsed ? "justify-center" : ""
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
              )}
              <div className="flex items-center gap-3">
                <item.icon className={cn("shrink-0 transition-transform duration-300 group-hover:scale-110", collapsed ? "h-5 w-5" : "h-[18px] w-[18px]", isActive ? "text-primary" : "text-muted-foreground")} />
                {!collapsed && <span>{t(`sidebar.${item.id}`)}</span>}
              </div>
              {!collapsed && item.isPro && (
                <Badge variant="secondary" className="h-4 px-1.5 text-[8px] bg-primary/10 text-primary border-none font-bold uppercase tracking-wider">
                  {t('sidebar.pro')}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User & Settings */}
      <div className="mt-auto p-3 space-y-2 border-t border-border/40">
        {/* User Profile */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "flex items-center gap-3 w-full p-2 rounded-xl hover:bg-sidebar-accent transition-all duration-300 group",
                collapsed ? "justify-center" : ""
              )}>
                <Avatar className="h-8 w-8 border border-border/50 group-hover:border-primary/50 transition-all">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-xs font-bold text-foreground truncate w-full">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate w-full">
                      {t('common.active_session')}
                    </span>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mb-2 bg-card/95 backdrop-blur-xl border-border/50">
              <DropdownMenuLabel className="font-heading text-xs font-bold text-muted-foreground uppercase tracking-widest px-3 py-2">
                Mi Cuenta
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/40" />
              <DropdownMenuItem className="focus:bg-primary/10 focus:text-primary transition-colors cursor-pointer py-2 px-3">
                <User className="mr-2 h-4 w-4" />
                <span className="text-xs font-semibold">Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/40" />
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="focus:bg-destructive/10 focus:text-destructive transition-colors cursor-pointer py-2 px-3 text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="text-xs font-bold">Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login" className="block w-full">
            <Button variant="ghost" className="w-full justify-start gap-3 h-10 px-2 hover:bg-primary/10 hover:text-primary">
              <LogOut className="h-4 w-4 rotate-180" />
              {!collapsed && <span className="text-xs font-bold">Entrar</span>}
            </Button>
          </Link>
        )}

        {/* Toggles */}
        <div className={cn("flex flex-col gap-2", collapsed ? "items-center" : "")}>
           <button
            onClick={toggleTheme}
             className={cn(
              "flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-2 px-3 transition-all hover:bg-white/10 hover:border-white/20",
              collapsed ? "p-2 px-2" : "w-full"
            )}
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
              {isDark ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
            </div>
            {!collapsed && (
              <span className="text-xs font-semibold text-foreground/80">
                {isDark ? t('sidebar.light_mode') : t('sidebar.dark_mode')}
              </span>
            )}
          </button>

          <button
            onClick={toggleLanguage}
            className={cn(
              "flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-2 px-3 transition-all hover:bg-white/10 hover:border-white/20",
              collapsed ? "p-2 px-2" : "w-full"
            )}
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full overflow-hidden shadow-sm ring-1 ring-white/20">
              {i18n.language === 'es' ? (
                <img src="https://flagcdn.com/w40/es.png" alt="ES" className="h-full w-full object-cover" />
              ) : (
                <img src="https://flagcdn.com/w40/gb.png" alt="EN" className="h-full w-full object-cover" />
              )}
            </div>
            {!collapsed && (
              <div className="flex flex-1 items-center justify-between">
                <span className="text-xs font-semibold text-foreground/80">
                  {i18n.language === 'es' ? 'Español' : 'English'}
                </span>
                <Globe className="h-3 w-3 text-muted-foreground opacity-50" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Signature */}
      <DeveloperSignature collapsed={collapsed} />
    </aside>
  );
}

export function MobileNav() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { t } = useTranslation();

  const mobileItems = navItems.slice(0, 5);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="fixed inset-x-0 bottom-0 z-30 h-16 md:hidden" />;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-border/50 bg-background/80 backdrop-blur-xl py-3 md:hidden">
      {mobileItems.map((item) => {
        const isActive =
          item.to === "/"
            ? pathname === "/"
            : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            href={item.to}
            className={cn(
              "flex flex-col items-center gap-1 text-[10px] transition-all",
              isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{t(`sidebar.${item.id}`)}</span>
          </Link>
        );
      })}
    </nav>
  );
}