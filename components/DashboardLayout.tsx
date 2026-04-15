// Este es el código que debes usar:
'use client';

import { AppSidebar, MobileNav } from "./AppSidebar";
import { useEffect, useState } from "react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen bg-[#f8f5f2] dark:bg-[#0f1115] transition-colors duration-500">
      <AppSidebar />
      <main className="md:ml-64 pb-20 md:pb-0 min-h-screen flex items-center justify-center p-4 lg:p-8">
        {/* Book Container */}
        <div className="relative w-full max-w-[1600px] min-h-[90vh] bg-white dark:bg-[#161b22] rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] border-[12px] border-slate-900 dark:border-slate-800 overflow-hidden flex flex-col">
          
          {/* Spine Ribbon decorative */}
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-r from-slate-900/10 to-transparent z-10" />
          
          {/* Subtle Paper Texture Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply dark:mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/paper.png')]" />

          {/* Content Scroll Area */}
          <div className="relative flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
             {/* Bookmark ribbon */}
            <div className="absolute top-0 right-12 w-6 h-20 bg-primary/20 rounded-b-lg border-x border-b border-primary/30 z-20 flex flex-col items-center pt-2">
              <div className="w-1 h-12 bg-primary/40 rounded-full" />
            </div>

            <div className="relative z-10 animate-fade-in-up">
              {children}
            </div>
          </div>

          {/* Page Footer / Page Number shadow */}
          <div className="h-12 border-t border-border/40 bg-muted/30 flex items-center justify-between px-8 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
            <span>mkt.notes // premium digital agenda</span>
            <div className="flex items-center gap-4">
              <span>Section: {typeof window !== 'undefined' ? window.location.pathname.replace('/', '') || 'index' : ''}</span>
              <span className="opacity-30">|</span>
              <span>2026 Edition</span>
            </div>
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}