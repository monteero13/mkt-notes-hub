"use client";

import { AppSidebar } from "./layout/app-sidebar";
import { AppTopbar } from "./layout/app-topbar";
import { CommandPalette } from "./layout/command-palette";
import { OnboardingTour } from "@/components/features/onboarding/onboarding-tour";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useWorkspace } from "@/hooks/use-workspace";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

function DashboardContent({ children }: { children: React.ReactNode }) {
  // Only authLoading truly blocks: we need to know if the user is authenticated.
  // workspaceLoading (members, invites, subscription) is non-critical and handled locally.
  const { user, isLoading: authLoading, isFetching } = useAuth();
  const { workspaces, activeWorkspace } = useWorkspace();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Sidebar collapsed and Zen Focus states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  useEffect(() => {
    const storedCollapsed = localStorage.getItem("mkt_sidebar_collapsed") === "true";
    const storedFocus = localStorage.getItem("mkt_focus_mode") === "true";
    setIsSidebarCollapsed(storedCollapsed);
    setIsFocusMode(storedFocus);
  }, []);

  const handleToggleCollapse = () => {
    const newValue = !isSidebarCollapsed;
    setIsSidebarCollapsed(newValue);
    localStorage.setItem("mkt_sidebar_collapsed", String(newValue));
  };

  const handleToggleFocus = () => {
    const newValue = !isFocusMode;
    setIsFocusMode(newValue);
    localStorage.setItem("mkt_focus_mode", String(newValue));
  };

  useEffect(() => {
    if (pathname === '/demo') return;
    // Only redirect after auth resolves
    if (!authLoading && !user) {
      router.push('/login?mode=login');
      return;
    }
    // Redirect to onboarding if authenticated but no workspaces (and not currently fetching)
    if (!authLoading && !isFetching && user && workspaces.length === 0 && pathname !== '/onboarding') {
      router.push('/onboarding');
    }
  }, [authLoading, isFetching, user, workspaces, router, pathname]);

  // Show a minimal full-screen spinner only during the initial auth check.
  // Once auth resolves (whether or not workspace data is ready), show the layout.
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  // If not authenticated (and redirect is pending), avoid flashing content.
  if (!user) return null;

  return (
    <div className={cn(
      "flex h-screen overflow-hidden bg-background transition-colors duration-500",
      isFocusMode && "focus-mode-active"
    )}>
      <AppSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isFocusMode={isFocusMode}
      />
      <div className="flex flex-1 flex-col overflow-hidden transition-all duration-300">
        <AppTopbar
          onMenuClick={() => setIsMobileSidebarOpen(true)}
          onToggleCollapse={handleToggleCollapse}
          onToggleFocus={handleToggleFocus}
          isSidebarCollapsed={isSidebarCollapsed}
          isFocusMode={isFocusMode}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar transition-all duration-500">
          {children}
        </main>
      </div>
      <CommandPalette />
      <OnboardingTour />
    </div>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardContent>{children}</DashboardContent>
  );
}