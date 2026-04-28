'use client';

import { AppSidebar, MobileNav } from "./AppSidebar";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useTeam } from "@/hooks/use-features-data";
import { useTranslation } from "react-i18next";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { user, isLoading } = useAuth();
  const { data: team } = useTeam();
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // No redirigir si es la página de demo
    if (pathname === '/demo') return;
    
    if (mounted && !isLoading && !user) {
      router.push('/login?mode=login');
    }
  }, [mounted, isLoading, user, router, pathname]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-foreground flex font-body transition-colors duration-500">
      <AppSidebar />
      <main className="flex-1 md:ml-64 relative min-h-screen flex items-center justify-center p-4 lg:p-8">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/5 blur-[100px] -z-10 pointer-events-none" />

        {/* Premium Frame Container - RESTORED SCREEN LOOK */}
        <div className="relative w-full max-w-[1600px] min-h-[92vh] bg-white dark:bg-[#0f1115] rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border-[12px] border-slate-900 dark:border-zinc-900 overflow-hidden flex flex-col transition-all duration-500">
          
          {/* Internal Frame Content Area */}
          <div className="relative flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="relative z-10 flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
              {children}
            </div>
          </div>

          {/* Internal Frame Footer */}
          <div className="h-12 border-t border-black/5 dark:border-white/5 bg-zinc-100/50 dark:bg-black/40 backdrop-blur-md flex items-center justify-between px-10 text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] pointer-events-none shrink-0">
            <div className="flex items-center gap-6">
              <span>MKT.NOTES // PREMIUM DIGITAL AGENDA</span>
              <span className="opacity-20">|</span>
              <span className="text-primary/60">{t('sidebar.personal_hub')}: {team?.name || 'PERSONAL HUB'}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>{t('sidebar.section')}: {pathname.split('/').pop()?.toUpperCase() || 'DASHBOARD'}</span>
              <span className="opacity-20">|</span>
              <span>2026 EDITION</span>
            </div>
          </div>
        </div>

        {/* Mobile Nav bar */}
        <MobileNav />
      </main>
    </div>
  );
}