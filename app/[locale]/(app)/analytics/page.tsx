import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getDefaultWorkspaceId } from "@/lib/utils/workspace-server";
import { redirect } from "next/navigation";
import { AnalyticsDashboardWrapper } from "@/components/features/analytics/analytics-dashboard-wrapper";
import { DashboardLayout } from "@/components/DashboardLayout";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = { title: "Analítica | MKT.NOTES" };

export default async function AnalyticsPage() {
  const t = await getTranslations("analisis");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const workspaceId = await getDefaultWorkspaceId(user.id);
  if (!workspaceId) redirect("/onboarding");

  // Check PRO status via Admin Client (Syncing with useWorkspace client logic)
  const adminSupabase = await createAdminClient();
  
  const [
    { data: workspace },
    { data: subscription }
  ] = await Promise.all([
    adminSupabase.from("workspaces").select("plan").eq("id", workspaceId).single(),
    adminSupabase.from("subscriptions").select("plan, status").eq("workspace_id", workspaceId).maybeSingle()
  ]);

  const hasProPlan = ["pro", "enterprise"].includes(workspace?.plan ?? "free");
  const hasActiveSub = ["active", "trialing"].includes(subscription?.status ?? "");
  const isPro = hasProPlan || hasActiveSub;

  // Time window: Last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    { data: snapshots },
    { data: campaigns },
    { data: clients },
    { count: completedTasksCount },
  ] = await Promise.all([
    supabase
      .from("analytics_snapshots")
      .select("*")
      .eq("workspace_id", workspaceId)
      .gte("metric_date", thirtyDaysAgo.toISOString().split("T")[0]!)
      .order("metric_date"),
    supabase.from("campaigns").select("id, name, status, budget, platform").eq("workspace_id", workspaceId),
    supabase.from("clients").select("id, company_name, monthly_retainer, status").eq("workspace_id", workspaceId),
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("status", "done")
      .gte("completed_at", thirtyDaysAgo.toISOString()),
  ]);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-background">
      {/* Top Operational Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-8">
        <div className="flex items-center gap-4">
          <div className="text-sm font-semibold text-foreground">{t("title")}</div>
          <div className="h-4 w-[1px] bg-border" />
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Dashboard</span>
            <ChevronRight size={12} className="opacity-60" />
            <span className="text-brand">{t("filter_30d")}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-4xl font-light tracking-tight" style={{ fontFamily: "var(--font-clash), sans-serif" }}>{t("title")}</h1>
          <p className="text-xs font-semibold technical-label opacity-60 uppercase tracking-wider">{t("subtitle")}</p>
        </div>

        <AnalyticsDashboardWrapper
          isPro={isPro}
          snapshots={snapshots ?? []}
          campaigns={campaigns ?? []}
          clients={clients ?? []}
          completedTasks={completedTasksCount ?? 0}
          workspaceId={workspaceId}
        />
      </div>
      </div>
    </DashboardLayout>
  );
}
