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
import { MoreHorizontal, Edit, Trash2, Target, Calendar, ArrowUpRight } from "lucide-react";
import { formatCurrency, getInitials } from "@/lib/utils/workspace";
import { deleteCampaign } from "@/actions/campaigns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@/lib/utils/cn";

import { useTranslations } from "next-intl";

interface Props {
  campaign: Campaign & { client?: Client | null; owner?: Profile | null };
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
    if (result.error) { toast.error(result.error); setDeleting(false); }
    else { toast.success(tc("delete_success")); router.refresh(); }
  }

  const STATUS_STYLES: Record<string, string> = {
    active: "bg-success/10 text-success border-success/20",
    draft: "bg-muted/10 text-muted-foreground border-border",
    paused: "bg-warning/10 text-warning border-warning/20",
    completed: "bg-brand/10 text-brand border-brand/20",
    archived: "bg-error/10 text-error border-error/20",
  };

  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-brand hover:shadow-xl active:scale-[0.98] overflow-hidden">
      {/* Visual Indicator */}
      <div className={cn("absolute top-0 right-0 h-1 w-full", campaign.status === 'active' ? 'bg-success' : 'bg-border/30')} />

      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("inline-flex items-center rounded-sm px-1.5 py-0.5 text-xs font-semibold border", STATUS_STYLES[campaign.status] ?? STATUS_STYLES.draft)}>
              {t(`status_${campaign.status}`)}
            </span>
            {campaign.platform && (
              <span className="text-xs font-semibold text-muted-foreground/60">
                / {tp(campaign.platform)}
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground group-hover:text-brand transition-colors line-clamp-1">
            {campaign.name}
          </h3>
          {campaign.client && (
            <p className="mt-1 text-xs font-semibold text-brand truncate">
              {campaign.client.company_name}
            </p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-sm border-border bg-card p-1 shadow-2xl">
            <DropdownMenuItem className="text-xs cursor-pointer">
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
        <p className="mb-6 text-sm text-muted-foreground leading-relaxed line-clamp-2 italic">
          "{campaign.description}"
        </p>
      )}

      <div className="mt-auto grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground/60">{tc("capital_allocation")}</div>
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Target size={12} className="text-brand" />
            {campaign.budget ? formatCurrency(campaign.budget) : "---"}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground/60">{tc("operational_window")}</div>
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Calendar size={12} className="text-brand" />
            {campaign.start_date ? format(new Date(campaign.start_date), "MMM d") : "TBD"}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
        {campaign.owner && (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6 rounded-sm transition-all border border-border">
              <AvatarImage src={campaign.owner.avatar_url ?? undefined} />
              <AvatarFallback className="text-xs font-bold">{getInitials(campaign.owner.full_name)}</AvatarFallback>
            </Avatar>
            <span className="text-xs font-semibold text-foreground">{campaign.owner.full_name?.split(' ')[0]}</span>
          </div>
        )}
        <Button variant="ghost" size="sm" className="h-7 px-2 rounded-sm text-xs font-medium gap-1 hover:bg-accent/5">
          {tc("view_intel")} <ArrowUpRight size={10} />
        </Button>
      </div>
    </div>
  );
}
