'use client';

import dynamic from 'next/dynamic';
import { DashboardLayout } from "@/components/DashboardLayout";
import Link from "next/link";
import { ChevronRight, ArrowUpRight } from "lucide-react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useContent } from "@/hooks/use-features-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWorkspace } from "@/hooks/use-workspace";
import { Campaign } from "@/types";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

// --- Dynamic imports: defer heavy components until after initial paint ---
const DashboardStats = dynamic(
  () => import("@/components/features/analytics/dashboard-stats").then(m => ({ default: m.DashboardStats })),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-sm border border-border bg-accent/5 animate-pulse" />
        ))}
      </div>
    ),
  }
);

const TasksOverview = dynamic(
  () => import("@/components/features/tasks/tasks-overview").then(m => ({ default: m.TasksOverview })),
  { ssr: false, loading: () => <div className="h-40 rounded-sm border border-border bg-accent/5 animate-pulse" /> }
);

const UpcomingContent = dynamic(
  () => import("@/components/features/content/upcoming-content").then(m => ({ default: m.UpcomingContent })),
  { ssr: false, loading: () => <div className="h-32 rounded-sm border border-border bg-accent/5 animate-pulse" /> }
);

const RecentActivity = dynamic(
  () => import("@/components/features/analytics/recent-activity").then(m => ({ default: m.RecentActivity })),
  { ssr: false, loading: () => <div className="h-32 rounded-sm border border-border bg-accent/5 animate-pulse" /> }
);

const QuickActions = dynamic(
  () => import("@/components/features/analytics/quick-actions").then(m => ({ default: m.QuickActions })),
  { ssr: false, loading: () => <div className="h-8 w-24 rounded-sm border border-border bg-accent/5 animate-pulse" /> }
);

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const { profile } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const { campaigns, tasks, counts } = useDashboardData();
  const { data: content = [] } = useContent();
  const router = useRouter();

  const firstName = profile?.full_name?.toUpperCase() || 'OPERATOR';
  const displayCampaigns = campaigns.length > 0 ? campaigns.slice(0, 6) : [];

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-background">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
          
          {/* Welcome Index & Global Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-6">
            <div className="flex flex-col gap-1.5">
              <div className="technical-label text-brand font-bold uppercase tracking-widest text-[9px]">{t("welcome.badge")}</div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground uppercase" style={{ fontFamily: "var(--font-clash), sans-serif" }}>
                {t("welcome.title", { name: firstName })}
              </h1>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Button variant="outline" className="h-9 rounded-md border-border bg-accent/5 px-4 technical-label text-[10px] text-muted-foreground hover:bg-accent/10 hover:text-foreground transition-all active:scale-95" asChild>
                <Link href="/analytics" className="flex items-center gap-2">
                  <ArrowUpRight size={12} />
                  {t("header.actions.audit")}
                </Link>
              </Button>
              <QuickActions />
            </div>
          </div>

          {/* High-Impact Metrics — deferred */}
          <DashboardStats
            activeCampaigns={counts.campaigns}
            pendingTasks={counts.pendingTasks}
            scheduledThisWeek={0}
            totalClients={counts.totalClients}
          />

          {/* Symmetrical Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
            
            {/* LEFT COLUMN - Operations & Logs */}
            <div className="space-y-6 sm:space-y-8">
              {/* CAMPAIGNS CARD */}
              <Card className="rounded-xl border-border bg-card shadow-sm overflow-hidden">
                <CardHeader className="flex-row items-center justify-between h-14 border-b border-border px-6 py-0 space-y-0 bg-accent/5">
                  <div className="text-sm font-semibold tracking-tight text-foreground">{t("campaigns.title")}</div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-sm bg-success animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("campaigns.live_badge")}</span>
                  </div>
                </CardHeader>

                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-accent/5">
                        <th className="text-xs font-semibold text-muted-foreground uppercase py-3.5 px-6">{t("campaigns.table.campaign")}</th>
                        <th className="text-xs font-semibold text-muted-foreground uppercase py-3.5 px-6">{t("campaigns.table.owner")}</th>
                        <th className="text-xs font-semibold text-muted-foreground uppercase py-3.5 px-6">{t("campaigns.table.status")}</th>
                        <th className="text-xs font-semibold text-muted-foreground uppercase py-3.5 px-6">{t("campaigns.table.progress")}</th>
                        <th className="text-xs font-semibold text-muted-foreground uppercase py-3.5 px-6 text-right"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayCampaigns.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center">
                            <div className="technical-label text-[10px] opacity-40 uppercase tracking-widest text-muted-foreground">
                              {t("campaigns.empty")}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        displayCampaigns.map((camp: Campaign) => (
                          <tr 
                            key={camp.id} 
                            className="border-b border-border/50 hover:bg-accent/5 transition-colors group cursor-pointer"
                            onClick={() => router.push(`/campaigns/${camp.id}`)}
                          >
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium tracking-tight text-foreground group-hover:text-brand transition-colors">{camp.name}</span>
                                <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wide">{camp.platform ?? 'CORE'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5 rounded-sm border border-border">
                                  <AvatarImage src={camp.owner?.avatar_url || ''} />
                                  <AvatarFallback className="text-[8px] font-black">{camp.owner?.full_name?.charAt(0) ?? 'A'}</AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-semibold text-foreground/90 truncate max-w-[80px]">{camp.owner?.full_name?.split(' ')[0] ?? 'Agent'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  "h-1.5 w-1.5 rounded-sm",
                                  camp.status === 'active' ? 'bg-success' : 'bg-brand'
                                )} />
                                <span className="text-[10px] font-bold uppercase tracking-wide">{camp.status}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="w-24 space-y-1.5">
                                <div className="flex justify-between text-[8px] font-black technical-label text-muted-foreground opacity-60">
                                  <span>{t("campaigns.table.health")}</span>
                                  <span>74%</span>
                                </div>
                                <div className="h-1 w-full bg-accent/10 rounded-sm overflow-hidden">
                                  <div className="h-full bg-brand w-[74%]" />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="p-1 hover:text-brand text-muted-foreground/60 transition-colors">
                                <ArrowUpRight size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </CardContent>
                <div className="h-10 border-t border-border flex items-center justify-center bg-accent/5">
                  <Link href="/campaigns" className="text-xs font-semibold text-muted-foreground hover:text-brand transition-colors cursor-pointer flex items-center gap-2">
                    {t("campaigns.view_all")} <ChevronRight size={10} />
                  </Link>
                </div>
              </Card>

              {/* OPERATIONAL LOGS */}
              <RecentActivity />
            </div>

            {/* RIGHT COLUMN - Planning & Actions */}
            <div className="space-y-6 sm:space-y-8">
              {/* TASKS OVERVIEW */}
              <TasksOverview tasks={tasks} />

              {/* UPCOMING CONTENT */}
              <UpcomingContent items={content} />
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
