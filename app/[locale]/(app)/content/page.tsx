'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { Instagram, Youtube, Linkedin, Music2, Plus, PenTool, Loader2, Trash2, ChevronRight, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { useContent } from "@/hooks/use-features-data";
import { Button } from "@/components/ui/button";
import { CreateContentDialog } from "@/components/CreateContentDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ContenidoPage() {
  const t = useTranslations("content_manager");
  const tc = useTranslations("common");
  const locale = useLocale();

  const { data: content = [], isLoading } = useContent();
  const [filter, setFilter] = useState("all");
  const queryClient = useQueryClient();
  const supabase = createClient();

  const platformIcons: Record<string, any> = {
    Instagram: { icon: Instagram, label: "Instagram" },
    YouTube: { icon: Youtube, label: "YouTube" },
    LinkedIn: { icon: Linkedin, label: "LinkedIn" },
    TikTok: { icon: Music2, label: "TikTok" },
  };

  const statusConfig: Record<'draft' | 'in_progress' | 'published', { label: string; color: string }> = {
    draft: { label: t("statuses.drafting"), color: "text-muted-foreground bg-muted" },
    in_progress: { label: t("statuses.in_review"), color: "text-warning bg-warning/10" },
    published: { label: t("statuses.published"), color: "text-success bg-success/10" },
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('content_items').delete().eq('id', id);
      if (error) throw error;
      toast.success(t("actions.toast.deleted"));
      queryClient.invalidateQueries({ queryKey: ['content'] });
    } catch (error: any) {
      toast.error(tc("error") + ': ' + error.message);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('content_items').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      toast.success(t("actions.toast.updated"));
      queryClient.invalidateQueries({ queryKey: ['content'] });
    } catch (error: any) {
      toast.error(tc("error") + ': ' + error.message);
    }
  };

  const filtered = filter === "all" ? content : content.filter((c: any) => c.status === filter);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-background">
        {/* Top Control Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="text-sm font-semibold text-foreground">{t("header.title")}</div>
            <div className="h-4 w-[1px] bg-border" />
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span>{t("header.subtitle")}</span>
              <ChevronRight size={12} className="opacity-30" />
              <span className="text-brand">{t("header.matrix")}</span>
            </div>
          </div>
          <CreateContentDialog>
            <Button className="h-8 rounded-sm bg-brand px-4 text-sm font-semibold text-white hover:opacity-90">
              <Plus className="mr-2 h-3 w-3" />
              {t("header.add")}
            </Button>
          </CreateContentDialog>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
          {isLoading ? (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-brand/20" />
              <span className="text-xs font-medium text-muted-foreground/60">{t("inventory.loading")}</span>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <div className="flex flex-col gap-1">
                <div className="technical-label text-brand">{t("inventory.subtitle")}</div>
                <h1 className="text-4xl font-light tracking-tight" style={{ fontFamily: "var(--font-clash), sans-serif" }}>{t("inventory.title")}</h1>
              </div>

              {/* Status Filters */}
              <div className="flex gap-2 p-1 border border-border bg-card rounded-xl w-fit">
                {(["all", "draft", "in_progress", "published"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={cn(
                      "px-6 py-1.5 text-xs font-semibold rounded-lg transition-all",
                      filter === s ? "bg-brand text-white" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {s === "all" ? t("filters.all") : statusConfig[s].label}
                  </button>
                ))}
              </div>

              {content.length === 0 ? (
                <div className="h-[40vh] border border-dashed border-border flex flex-col items-center justify-center rounded-xl bg-accent/5">
                  <PenTool className="h-10 w-10 text-muted-foreground/10 mb-4" />
                  <span className="text-xs font-medium text-muted-foreground/60">{t("inventory.empty")}</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {filtered.map((item: any) => {
                    const platform = platformIcons[item.platform as keyof typeof platformIcons] || { icon: PenTool, label: item.platform };
                    const status = statusConfig[(item.status as keyof typeof statusConfig) || 'draft'] || statusConfig.draft;
                    return (
                      <div
                        key={item.id}
                        className="group relative border border-border bg-card p-6 rounded-xl shadow-sm hover:border-brand transition-all flex flex-col gap-6 overflow-hidden"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <platform.icon size={12} className="text-muted-foreground/40" />
                            <span className="text-xs font-medium text-muted-foreground/60">{platform.label}</span>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className={cn(
                                "text-xs font-medium px-2 py-0.5 rounded-sm border cursor-pointer hover:opacity-80 transition-all",
                                status.color,
                                "border-current"
                              )}>
                                {status.label}
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-sm bg-card border-border">
                              {(['draft', 'in_progress', 'published'] as const).map((s) => (
                                <DropdownMenuItem
                                  key={s}
                                  onSelect={() => handleStatusChange(item.id, s)}
                                  className="text-xs py-2 cursor-pointer hover:bg-brand/10 hover:text-brand"
                                >
                                  {statusConfig[s].label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="flex-1">
                          <h3 className="text-lg font-light tracking-tight text-foreground group-hover:text-brand transition-colors leading-snug line-clamp-2 min-h-[2.5rem]" style={{ fontFamily: "var(--font-clash), sans-serif" }}>
                            {item.title}
                          </h3>
                        </div>

                        <div className="pt-6 border-t border-border flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground/60">{item.type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground/50">
                              {item.date ? new Date(item.date).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', { day: '2-digit', month: 'short' }) : 'TBD'}
                            </span>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                              <DeleteConfirmDialog
                                onConfirm={() => handleDelete(item.id)}
                                title={t("actions.delete_confirm")}
                              >
                                <button className="p-1 text-muted-foreground/30 hover:text-error transition-colors">
                                  <Trash2 size={12} />
                                </button>
                              </DeleteConfirmDialog>
                              <ArrowUpRight size={12} className="text-brand/60" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
