"use client";

import { useState } from "react";
import type { Campaign, Client, Profile } from "@/types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Target, 
  Calendar, 
  ArrowUpRight,
  CheckSquare,
  FileText,
  FolderOpen,
  Brain
} from "lucide-react";
import { formatCurrency, getInitials } from "@/lib/utils/workspace";
import { deleteCampaign } from "@/actions/campaigns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@/lib/utils/cn";

import { useTranslations } from "next-intl";

interface Props {
  campaign: Campaign & { 
    client?: Client | null; 
    owner?: Profile | null;
    tasks?: any[] | null;
    content_items?: any[] | null;
    resources?: any[] | null;
    brainstorm_boards?: any[] | null;
  };
  workspaceId: string;
}

export function CampaignCard({ campaign, workspaceId }: Props) {
  const t = useTranslations("campanas");
  const tc = useTranslations("campanas.card");
  const tp = useTranslations("campanas.platforms");
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(tc("delete_confirm"))) return;
    setDeleting(true);
    const result = await deleteCampaign(campaign.id, workspaceId);
    if (result.error) { 
      toast.error(result.error); 
      setDeleting(false); 
    } else { 
      toast.success(tc("delete_success")); 
      router.refresh(); 
    }
  }

  const STATUS_STYLES: Record<string, string> = {
    active: "bg-success/5 text-success border-success/20",
    draft: "bg-muted/10 text-muted-foreground border-border",
    paused: "bg-warning/5 text-warning border-warning/20",
    completed: "bg-brand/5 text-brand border-brand/20",
    archived: "bg-error/5 text-error border-error/20",
  };

  // Compute tasks progress
  const totalTasks = campaign.tasks?.length || 0;
  const completedTasks = campaign.tasks?.filter((task: any) => task.status === "done").length || 0;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-brand/30 hover:shadow-md active:scale-[0.99] overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-brand/5 blur-2xl pointer-events-none group-hover:bg-brand/10 transition-all duration-300" />

      {/* Header section */}
      <div className="mb-4 flex items-start justify-between gap-4 relative">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border", STATUS_STYLES[campaign.status] ?? STATUS_STYLES.draft)}>
              {t(`status_${campaign.status}`)}
            </span>
            {campaign.platform && (
              <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                {campaign.platform.replace("_", " ")}
              </span>
            )}
          </div>
          <h3 
            className="text-lg font-light tracking-tight text-foreground group-hover:text-brand transition-colors line-clamp-1"
            style={{ fontFamily: "var(--font-clash), sans-serif" }}
          >
            {campaign.name}
          </h3>
          {campaign.client && (
            <p className="mt-1 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">
              {campaign.client.company_name}
            </p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-sm border-border bg-card p-1 shadow-2xl">
            <DropdownMenuItem className="text-xs cursor-pointer" onClick={() => router.push(`/campaigns/${campaign.id}?tab=overview`)}>
              <Edit size={12} className="mr-3" /> {tc("audit_strategy")}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem className="text-error text-xs cursor-pointer focus:bg-error/10 focus:text-error" onClick={handleDelete} disabled={deleting}>
              <Trash2 size={12} className="mr-3" /> {tc("terminate_node")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {campaign.description && (
        <p className="mb-5 text-xs text-muted-foreground/60 leading-relaxed line-clamp-2">
          {campaign.description}
        </p>
      )}

      {/* Real-time Progressive Health/Completion meter */}
      <div className="space-y-2 mb-5 border-t border-border/30 pt-4">
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
          <span>Progreso de Tareas</span>
          <span className="text-brand font-bold">{taskProgress}% ({completedTasks}/{totalTasks})</span>
        </div>
        <div className="h-2 w-full bg-accent/5 rounded-full overflow-hidden border border-border/40">
          <div 
            className="h-full bg-brand transition-all duration-500 ease-out rounded-full" 
            style={{ width: `${taskProgress}%` }} 
          />
        </div>
      </div>

      {/* Symmetrical Grid of Live Mapped Assets — styled with high coherence */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { label: "Tareas", value: totalTasks, icon: CheckSquare, subtext: `${completedTasks} listas`, href: `?tab=tasks` },
          { label: "Contenidos", value: campaign.content_items?.length || 0, icon: FileText, subtext: "piezas", href: `?tab=content` },
          { label: "Assets", value: campaign.resources?.length || 0, icon: FolderOpen, subtext: "archivos", href: `?tab=assets` },
          { label: "Brainstorms", value: campaign.brainstorm_boards?.length || 0, icon: Brain, subtext: "tableros", href: `?tab=brainstorm` },
        ].map((item, idx) => {
          const StatIcon = item.icon;
          return (
            <div 
              key={idx} 
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/campaigns/${campaign.id}${item.href}`);
              }}
              className="flex flex-col p-3 rounded-xl border border-border/40 bg-card/50 hover:border-brand/30 hover:bg-accent/5 transition-all group/item cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">{item.label}</span>
                <StatIcon size={12} className="text-muted-foreground/40 group-hover/item:text-brand transition-colors" />
              </div>
              <div 
                className="text-xl font-light text-foreground group-hover/item:text-brand transition-colors leading-none"
                style={{ fontFamily: "var(--font-clash), sans-serif" }}
              >
                {item.value}
              </div>
              <span className="text-[9px] text-muted-foreground/40 font-medium mt-1 truncate">{item.subtext}</span>
            </div>
          );
        })}
      </div>

      {/* Capital Allocation & Operational Window */}
      <div className="mt-auto grid grid-cols-2 gap-4 border-t border-border/30 pt-4">
        <div className="space-y-0.5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">{tc("capital_allocation")}</div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Target size={12} className="text-brand shrink-0" />
            {campaign.budget ? formatCurrency(campaign.budget) : "—"}
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">{tc("operational_window")}</div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Calendar size={12} className="text-brand shrink-0" />
            {campaign.start_date ? format(new Date(campaign.start_date), "MMM d") : "TBD"}
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-border/30 pt-4">
        {campaign.owner ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6 rounded-lg transition-all border border-border">
              <AvatarImage src={campaign.owner.avatar_url ?? undefined} />
              <AvatarFallback className="text-[10px] font-bold rounded-lg bg-brand/10 text-brand">
                {campaign.owner.full_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-semibold text-muted-foreground">
              {campaign.owner.full_name?.split(' ')[0]}
            </span>
          </div>
        ) : (
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Sin propietario</div>
        )}
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 rounded-lg border-border bg-accent/5 text-[10px] font-bold uppercase tracking-widest gap-1.5 hover:bg-brand/10 hover:text-brand hover:border-brand/20 active:scale-95 transition-all"
          onClick={() => router.push(`/campaigns/${campaign.id}`)}
        >
          {tc("view_intel")} <ArrowUpRight size={11} className="stroke-[2.5]" />
        </Button>
      </div>
    </div>
  );
}
