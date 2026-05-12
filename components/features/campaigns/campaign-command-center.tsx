"use client";

import { useRouter, useParams } from "next/navigation";
import {
  LayoutDashboard, CheckSquare, FileText,
  FolderOpen, BarChart2, Lightbulb, ArrowLeft, Zap,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { Campaign, Task, ContentItem, Resource, AnalyticsSnapshot, BrainstormBoard, ActivityLog, Client, Profile } from "@/types";
import { CcOverview } from "./tabs/cc-overview";
import { CcTasks } from "./tabs/cc-tasks";
import { CcContent } from "./tabs/cc-content";
import { CcAssets } from "./tabs/cc-assets";
import { CcAnalytics } from "./tabs/cc-analytics";
import { CcBrainstorm } from "./tabs/cc-brainstorm";

const TABS = [
  { id: "overview",    label: "Overview",    icon: LayoutDashboard },
  { id: "tasks",       label: "Tareas",      icon: CheckSquare },
  { id: "content",     label: "Contenido",   icon: FileText },
  { id: "assets",      label: "Assets",      icon: FolderOpen },
  { id: "analytics",   label: "Analytics",   icon: BarChart2 },
  { id: "brainstorm",  label: "Brainstorm",  icon: Lightbulb },
] as const;

const STATUS_STYLES: Record<string, string> = {
  active:    "border-green-500/30 bg-green-500/10 text-green-400",
  draft:     "border-border bg-accent/10 text-muted-foreground",
  paused:    "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  completed: "border-brand/30 bg-brand/10 text-brand",
  archived:  "border-red-500/30 bg-red-500/10 text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Activa", draft: "Borrador", paused: "Pausada",
  completed: "Completada", archived: "Archivada",
};

interface Props {
  workspaceId: string;
  campaign: Campaign & { client?: Client | null; owner?: Profile | null };
  tasks: Task[];
  content: ContentItem[];
  assets: Resource[];
  snapshots: AnalyticsSnapshot[];
  boards: BrainstormBoard[];
  activity: ActivityLog[];
  members: Profile[];
  clients: { id: string; company_name: string }[];
  campaigns: { id: string; name: string }[];
  activeTab: string;
  locale: string;
}

export function CampaignCommandCenter({
  workspaceId, campaign, tasks, content, assets, snapshots, boards, activity, members, clients, campaigns, activeTab, locale,
}: Props) {
  const router = useRouter();
  const params = useParams();

  function setTab(tab: string) {
    router.push(`?tab=${tab}`, { scroll: false });
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* ── Top Header ── */}
      <div className="flex h-16 shrink-0 items-center gap-4 border-b border-border px-4 sm:px-8">
        <Link
          href={`/${locale}/campaigns`}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          Campañas
        </Link>
        <div className="h-4 w-[1px] bg-border" />
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Zap size={14} className="text-brand shrink-0" />
          <span className="text-sm font-semibold text-foreground truncate">{campaign.name}</span>
          {campaign.client && (
            <span className="text-xs text-brand font-semibold truncate hidden sm:block">
              · {campaign.client.company_name}
            </span>
          )}
          <span className={cn(
            "hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border",
            STATUS_STYLES[campaign.status] ?? STATUS_STYLES.draft
          )}>
            {STATUS_LABELS[campaign.status] ?? campaign.status}
          </span>
        </div>
        {campaign.platform && (
          <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest hidden md:block">
            {campaign.platform.replace("_", " ")}
          </span>
        )}
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex h-11 shrink-0 items-center gap-1 border-b border-border px-4 sm:px-8 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-1.5 px-3 h-full text-[11px] font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap",
              activeTab === id
                ? "border-brand text-brand"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            <Icon size={12} />
            {label}
            {id === "tasks" && tasks.length > 0 && (
              <span className="ml-0.5 bg-accent/20 text-muted-foreground px-1 rounded-sm text-[9px]">
                {tasks.length}
              </span>
            )}
            {id === "content" && content.length > 0 && (
              <span className="ml-0.5 bg-accent/20 text-muted-foreground px-1 rounded-sm text-[9px]">
                {content.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {activeTab === "overview"   && <CcOverview campaign={campaign} tasks={tasks} activity={activity} contentCount={content.length} assetCount={assets.length} />}
          {activeTab === "tasks"      && <CcTasks tasks={tasks} workspaceId={workspaceId} members={members} clients={clients} campaigns={campaigns} campaign={campaign} />}
          {activeTab === "content"    && <CcContent content={content} campaignId={campaign.id} />}
          {activeTab === "assets"     && <CcAssets assets={assets} campaignId={campaign.id} />}
          {activeTab === "brainstorm" && <CcBrainstorm boards={boards} locale={locale} workspaceId={workspaceId} campaignId={campaign.id} />}
        </div>
      </div>
    </div>
  );
}
