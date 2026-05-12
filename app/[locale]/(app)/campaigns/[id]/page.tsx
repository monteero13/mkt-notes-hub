import { createClient } from "@/lib/supabase/server";
import { getDefaultWorkspaceId } from "@/lib/utils/workspace-server";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CampaignCommandCenter } from "@/components/features/campaigns/campaign-command-center";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Campaña | MKT.NOTES" };

const VALID_TABS = ["overview", "tasks", "content", "assets", "analytics", "brainstorm"] as const;
type ValidTab = typeof VALID_TABS[number];

export default async function CampaignDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; locale: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ id, locale }, sp, supabase] = await Promise.all([
    params,
    searchParams,
    createClient(),
  ]);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const workspaceId = await getDefaultWorkspaceId(user.id);
  if (!workspaceId) redirect("/onboarding");

  const activeTab: ValidTab =
    sp.tab && (VALID_TABS as readonly string[]).includes(sp.tab)
      ? (sp.tab as ValidTab)
      : "overview";

  const [
    { data: campaign },
    { data: tasks },
    { data: content },
    { data: assets },
    { data: snapshots },
    { data: boards },
    { data: activity },
    { data: rawMembers },
    { data: clients },
    { data: campaigns },
  ] = await Promise.all([
    supabase
      .from("campaigns")
      .select("*, client:clients(*), owner:profiles(*)")
      .eq("id", id)
      .eq("workspace_id", workspaceId)
      .single(),
    supabase
      .from("tasks")
      .select("*, assignee:profiles(id, full_name, avatar_url)")
      .eq("campaign_id", id)
      .order("sort_order"),
    supabase
      .from("content_items")
      .select("*")
      .eq("campaign_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("resources")
      .select("*")
      .eq("campaign_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("analytics_snapshots")
      .select("*")
      .eq("campaign_id", id)
      .order("metric_date", { ascending: false }),
    supabase
      .from("brainstorm_boards")
      .select("*")
      .eq("campaign_id", id),
    supabase
      .from("activity_logs")
      .select("*, user:profiles(id, full_name, avatar_url)")
      .eq("entity_type", "campaign")
      .eq("entity_id", id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("workspace_members")
      .select("role, profile:profiles(id, full_name, avatar_url, email)")
      .eq("workspace_id", workspaceId)
      .eq("is_active", true),
    supabase
      .from("clients")
      .select("id, company_name")
      .eq("workspace_id", workspaceId),
    supabase
      .from("campaigns")
      .select("id, name")
      .eq("workspace_id", workspaceId),
  ]);

  if (!campaign) redirect(`/${locale}/campaigns`);

  const members = (rawMembers ?? []).map((m: any) => m.profile).filter(Boolean);

  return (
    <DashboardLayout>
      <CampaignCommandCenter
        workspaceId={workspaceId}
        campaign={campaign as any}
        tasks={(tasks ?? []) as any[]}
        content={(content ?? []) as any[]}
        assets={(assets ?? []) as any[]}
        snapshots={(snapshots ?? []) as any[]}
        boards={(boards ?? []) as any[]}
        activity={(activity ?? []) as any[]}
        members={(members ?? []) as any[]}
        clients={(clients ?? []) as any[]}
        campaigns={(campaigns ?? []) as any[]}
        activeTab={activeTab}
        locale={locale}
      />
    </DashboardLayout>
  );
}
