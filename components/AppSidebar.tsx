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
  Globe,
  Sun,
  Moon,
  LogOut,
  User
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { DeveloperSignature } from "./DeveloperSignature";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuth } from "@/hooks/use-auth";
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
  { id: "dashboard", to: "/dashboard", icon: LayoutDashboard },
  { id: "planificador", to: "/planificador", icon: Calendar },
  { id: "contenido", to: "/contenido", icon: FileText },
  { id: "campanas", to: "/campanas", icon: BarChart3 },
  { id: "analisis", to: "/analisis", icon: Globe, isPro: true },
  { id: "objetivos", to: "/objetivos", icon: Target },
  { id: "ideas", to: "/ideas", icon: Lightbulb },
  { id: "biblioteca", to: "/biblioteca", icon: BookOpen },
  { id: "equipo", to: "/equipo", icon: Users, isPro: true },
];

export function AppSidebar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const supabase = createClient();
  
  const { user, profile, isLoading } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
    toast.success(t('sidebar.logout_success', 'Sesión cerrada correctamente'));
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(nextLang);
  };

  if (!mounted || isLoading) {
    return (
      <aside className="fixed inset-y-0 left-0 z-30 hidden md:flex flex-col bg-sidebar border-r border-sidebar-border w-64">
        <div className="flex h-24 items-center px-6">
          <div className="h-10 w-10 bg-muted animate-pulse rounded-lg" />
        </div>
      </aside>
    );
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || null;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden md:flex flex-col bg-sidebar border-r border-sidebar-border shadow-2xl w-64">
      {/* Logo */}
      <div className="flex h-24 items-center px-6 justify-between shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="h-10 w-10 flex items-center justify-center shrink-0">
            <div className="h-9 w-9 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black font-black text-xs">
              mkt
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tighter leading-none">mkt.notes</span>
            <span className="text-[7px] font-black text-primary uppercase tracking-[0.4em] mt-0.5 ml-0.5">{t('sidebar.marketing_hub')}</span>
          </div>
        </Link>
      </div>

      {/* Global Action Button */}
      <div className="px-4 mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" />
              {t('common.new', 'Nuevo')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 bg-card/95 backdrop-blur-xl border-border/50">
            <DropdownMenuLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-3 py-2">
              {t('sidebar.quick_actions', 'Acciones Rápidas')}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/40" />
            <DropdownMenuItem asChild>
              <Link href="/planificador" className="flex items-center w-full py-2 cursor-pointer">
                <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                <span className="text-xs font-bold">{t('dialogs.task.title')}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/objetivos" className="flex items-center w-full py-2 cursor-pointer">
                <Target className="mr-2 h-4 w-4 text-orange-500" />
                <span className="text-xs font-bold">{t('dialogs.objective.title')}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/campanas" className="flex items-center w-full py-2 cursor-pointer">
                <BarChart3 className="mr-2 h-4 w-4 text-purple-500" />
                <span className="text-xs font-bold">{t('dialogs.campaign.title')}</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-4 py-8 overflow-y-auto scrollbar-none">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.to);

          return (
            <Link
              key={item.to}
              href={item.to}
              className={cn(
                "group flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200",
                `tour-item-${item.id}`,
                isActive
                   ? "bg-primary/10 text-primary"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("shrink-0 h-5 w-5", isActive ? "text-primary" : "group-hover:text-sidebar-foreground")} />
                <span>{t(`sidebar.${item.id}`)}</span>
              </div>
              {item.isPro && (
                <div className="px-1.5 py-0.5 rounded-[4px] bg-primary/20 text-[8px] font-black tracking-widest text-primary uppercase ml-2">
                  PRO
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User & Settings */}
      <div className="mt-auto p-3 space-y-2 border-t border-border/40">
        {!profile?.is_pro && (
          <div className="mx-4 mb-6 p-6 bg-primary/10 border border-primary/20 rounded-3xl space-y-3 tour-upgrade-card relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 h-16 w-16 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all" />
            <p className="text-xs font-bold text-primary uppercase tracking-widest">{t('sidebar.premium_access')}</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">{t('sidebar.premium_desc')}</p>
            <Link href="/pricing" className="block w-full">
              <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl text-[10px] font-bold h-8">
                {t('sidebar.upgrade_now')}
              </Button>
            </Link>
          </div>
        )}

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-sidebar-accent transition-all duration-300 group">
                <Avatar className="h-9 w-9 border border-white/5 group-hover:border-primary/50 transition-all shadow-lg shrink-0">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start min-w-0 text-left">
                  <span className="text-xs font-black text-foreground truncate w-full tracking-tight">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60 truncate w-full font-bold uppercase tracking-widest mt-0.5">
                    {user?.email?.split('@')[0] || 'Marketing Lead'}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mb-2 bg-card/95 backdrop-blur-xl border-border/50">
              <DropdownMenuLabel className="font-heading text-xs font-bold text-muted-foreground uppercase tracking-widest px-3 py-2">
                {t('sidebar.my_account')}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/40" />
              <DropdownMenuItem asChild className="focus:bg-primary/10 focus:text-primary transition-colors cursor-pointer py-2 px-3">
                <Link href="/perfil" className="flex items-center w-full">
                   <User className="mr-2 h-4 w-4" />
                   <span className="text-xs font-semibold">{t('sidebar.profile')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/40" />
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="focus:bg-destructive/10 focus:text-destructive transition-colors cursor-pointer py-2 px-3 text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="text-xs font-bold">{t('sidebar.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}

        {/* Toggles */}
        <div className="flex flex-col gap-2">
           <button
            onClick={toggleTheme}
             className="flex items-center gap-3 rounded-2xl border border-sidebar-border bg-sidebar-accent/50 p-2 px-3 transition-all hover:bg-sidebar-accent hover:border-sidebar-border w-full"
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
              {theme === 'dark' ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
            </div>
            <span className="text-xs font-semibold text-foreground/80">
              {theme === 'dark' ? t('sidebar.light_mode') : t('sidebar.dark_mode')}
            </span>
          </button>

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-3 rounded-2xl border border-sidebar-border bg-sidebar-accent/50 p-2 px-3 transition-all hover:bg-sidebar-accent hover:border-sidebar-border w-full"
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full overflow-hidden shadow-sm ring-1 ring-white/20">
              {i18n.language === 'es' ? (
                <img src="https://flagcdn.com/w40/es.png" alt="ES" className="h-full w-full object-cover" />
              ) : (
                <img src="https://flagcdn.com/w40/gb.png" alt="EN" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="flex flex-1 items-center justify-between">
              <span className="text-xs font-semibold text-foreground/80">
                {i18n.language === 'es' ? 'Español' : 'English'}
              </span>
            </div>
          </button>
        </div>
      </div>

      <DeveloperSignature collapsed={false} />
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
    <nav className="fixed inset-x-4 bottom-4 z-30 flex items-center justify-around bg-background/80 backdrop-blur-2xl border border-border/50 py-4 rounded-[2.5rem] md:hidden shadow-2xl">
      {mobileItems.map((item) => {
        const isActive = pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            href={item.to}
            className={cn(
              "flex flex-col items-center gap-1.5 transition-all",
              isActive ? "text-blue-500 scale-110" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{t(`sidebar.${item.id}`).slice(0, 4)}</span>
          </Link>
        );
      })}
    </nav>
  );
}