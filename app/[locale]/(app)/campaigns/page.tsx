import { createClient } from "@/lib/supabase/server";
import { getDefaultWorkspaceId } from "@/lib/utils/workspace-server";
import { redirect } from "next/navigation";
import { CampaignCard } from "@/components/features/campaigns/campaign-card";
import { NewCampaignDialog } from "@/components/features/campaigns/new-campaign-dialog";
import type { Metadata } from "next";
import { ChevronRight, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { getTranslations } from "next-intl/server";
import { DashboardLayout } from "@/components/DashboardLayout";

export const metadata: Metadata = { title: "Campañas | MKT.NOTES" };

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string; status?: string }>;
}) {
  const [t, supabase] = await Promise.all([
    getTranslations("campanas"),
    createClient(),
  ]);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const workspaceId = await getDefaultWorkspaceId(user.id);
  if (!workspaceId) redirect("/onboarding");

  const params = await searchParams;

  let query = supabase
    .from("campaigns")
    .select("*, client:clients(id, company_name), owner:profiles(id, full_name, avatar_url), tasks(id, status), content_items(id), resources(id), brainstorm_boards(id)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (params.status) query = query.eq("status", params.status);

  const [{ data: rawCampaigns }, { data: clients }] = await Promise.all([
    query,
    supabase.from("clients").select("id, company_name").eq("workspace_id", workspaceId),
  ]);
  const campaigns = rawCampaigns as Array<{ id: string; status: string;[key: string]: unknown }> | null;

  const statusLabels: Record<string, string> = {
    all: t("status_all"),
    active: t("status_active"),
    draft: t("status_draft"),
    paused: t("status_paused"),
    completed: t("status_completed"),
  };

  const statusCounts: Record<string, number> = {
    all: campaigns?.length ?? 0,
    active: campaigns?.filter((c) => c.status === "active").length ?? 0,
    draft: campaigns?.filter((c) => c.status === "draft").length ?? 0,
    paused: campaigns?.filter((c) => c.status === "paused").length ?? 0,
    completed: campaigns?.filter((c) => c.status === "completed").length ?? 0,
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-background">
        {/* Top Operational Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="text-sm font-semibold text-foreground">{t("title")}</div>
            <div className="h-4 w-[1px] bg-border" />
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span>{t("title")}</span>
              <ChevronRight size={12} className="opacity-60" />
              <span className="text-brand">{t("status_active")}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NewCampaignDialog workspaceId={workspaceId} clients={clients ?? []} defaultOpen={params.new === "true"} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
          <div className="flex flex-col gap-1">
            <div className="technical-label text-brand">{t("desc")}</div>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl font-light tracking-tight" style={{ fontFamily: "var(--font-clash), sans-serif" }}>{t("title")}</h1>
              <span className="text-xs font-medium text-muted-foreground/60 mb-1.5">
                [{campaigns?.length ?? 0}]
              </span>
            </div>
          </div>

          {/* Filter Matrix */}
          <div className="flex gap-1 bg-accent/5 p-1 rounded-xl w-fit border border-border/50">
            {Object.keys(statusCounts).map((status) => {
              const isActive = (params.status ?? "all") === status;
              return (
                <Link
                  key={status}
                  href={status === "all" ? "/campaigns" : `/campaigns?status=${status}`}
                  className={cn(
                    "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
                    isActive
                      ? "bg-brand !text-white shadow-lg shadow-brand/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                  )}
                >
                  {statusLabels[status]}
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-sm text-xs font-bold",
                    isActive ? "bg-white/20" : "bg-accent/20"
                  )}>
                    {statusCounts[status]}
                  </span>
                </Link>
              );
            })}
          </div>

          {campaigns?.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-accent/5 py-24">
              <Zap size={32} className="mb-4 text-muted-foreground opacity-20" />
              <div className="text-sm font-semibold text-muted-foreground">{t("empty")}</div>
              <p className="mt-2 text-xs font-medium text-muted-foreground/60">{t("empty_desc")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {campaigns?.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign as any} workspaceId={workspaceId} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
