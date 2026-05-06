import { createClient } from "@/lib/supabase/server";
import { getDefaultWorkspaceId } from "@/lib/utils/workspace-server";
import { redirect } from "next/navigation";
import { ClientsTable } from "@/components/features/clients/clients-table";
import { NewClientDialog } from "@/components/features/clients/new-client-dialog";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { DashboardLayout } from "@/components/DashboardLayout";

export const metadata: Metadata = { title: "Clientes | MKT.NOTES" };

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const [t, supabase] = await Promise.all([
    getTranslations("clientes"),
    createClient(),
  ]);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const workspaceId = await getDefaultWorkspaceId(user.id);
  if (!workspaceId) redirect("/onboarding");

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("company_name");

  const params = await searchParams;

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-background">
      {/* Top Operational Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-8">
        <div className="flex items-center gap-4">
          <div className="technical-label text-[11px] text-foreground">{t("title")}</div>
          <div className="h-4 w-[1px] bg-border" />
          <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
            <span>{t("title")}</span>
            <ChevronRight size={12} className="opacity-60" />
            <span className="text-brand">{t("table.status")}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NewClientDialog workspaceId={workspaceId} defaultOpen={params.new === "true"} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
        <div className="flex flex-col gap-1">
          <div className="technical-label text-brand">{t("desc")}</div>
          <div className="flex items-end gap-4">
            <h1 className="text-4xl font-light tracking-tight" style={{ fontFamily: "var(--font-clash), sans-serif" }}>{t("title")}</h1>
            <span className="technical-label text-[10px] opacity-40 mb-1.5 uppercase tracking-[0.2em]">
              [{clients?.length ?? 0}]
            </span>
          </div>
        </div>

        <ClientsTable clients={clients ?? []} workspaceId={workspaceId} />
      </div>
      </div>
    </DashboardLayout>
  );
}
