'use client';

import { useTranslations } from "next-intl";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Lightbulb, Plus, Loader2, Trash2, Layers, ChevronRight, ArrowUpRight, Hash } from "lucide-react";
import { useIdeas } from "@/hooks/use-features-data";
import { CreateIdeaDialog } from "@/components/CreateIdeaDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function IdeasPage() {
  const { data: ideas = [], isLoading } = useIdeas();
  const queryClient = useQueryClient();
  const supabase = createClient();
  const t = useTranslations('ideas');
  const tCommon = useTranslations('common');

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('marketing_ideas').delete().eq('id', id);
      if (error) throw error;
      toast.success(t('delete_success'));
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
    } catch (error: any) {
      toast.error(tCommon('error') + ': ' + error.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-background">
        {/* Top Control Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="technical-label text-[11px] text-foreground">{t('innovation_lab')}</div>
            <div className="h-4 w-[1px] bg-border" />
            <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              <span>{t('ideation')}</span>
              <ChevronRight size={12} className="opacity-60" />
              <span className="text-brand">{t('concept_sandbox')}</span>
            </div>
          </div>
          <CreateIdeaDialog>
            <Button className="h-8 rounded-sm bg-brand px-4 technical-label text-[10px] text-white hover:opacity-90">
              <Plus className="mr-2 h-3 w-3" />
              {t('ingest_concept')}
            </Button>
          </CreateIdeaDialog>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
          {isLoading ? (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-brand/40" />
              <span className="technical-label text-[9px]">{t('analyzing_signals')}</span>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <div className="flex flex-col gap-1">
                <div className="technical-label text-brand">{t('creative_intelligence')}</div>
                <h1 className="text-4xl font-light tracking-tight" style={{ fontFamily: "var(--font-clash), sans-serif" }}>{t('idea_lab')}</h1>
              </div>

              {ideas.length === 0 ? (
                <div className="h-[40vh] border border-dashed border-border flex flex-col items-center justify-center rounded-sm bg-accent/5">
                  <Lightbulb className="h-10 w-10 text-muted-foreground/30 mb-4" />
                  <span className="technical-label text-[10px] opacity-60 uppercase tracking-widest">{t('sandbox_empty')}</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {ideas.map((idea: any) => (
                    <div
                      key={idea.id}
                      className="group relative border border-border bg-card p-6 rounded-[4px] shadow-sm hover:border-brand transition-all flex flex-col gap-8 overflow-hidden"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Hash size={10} className="text-brand" />
                            <span className="technical-label text-[8px] opacity-60">{idea.category || t('general')}</span>
                          </div>
                          <h3 className="text-lg font-light tracking-tight text-foreground group-hover:text-brand transition-colors leading-snug" style={{ fontFamily: "var(--font-clash), sans-serif" }}>
                            {idea.title}
                          </h3>
                        </div>
                        <DeleteConfirmDialog
                          onConfirm={() => handleDelete(idea.id)}
                          title={t('purge_concept')}
                        >
                          <button className="p-1 text-muted-foreground/40 hover:text-error transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </DeleteConfirmDialog>
                      </div>

                      <div className="flex-1">
                        {idea.description && (
                          <p className="text-xs text-muted-foreground/80 font-normal leading-relaxed line-clamp-4 normal-case">
                            {idea.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-6 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-6 w-6 rounded-[4px] bg-accent/5 border border-border flex items-center justify-center text-muted-foreground group-hover:bg-brand/10 group-hover:text-brand transition-colors">
                            <Layers size={12} />
                          </div>
                          <span className="technical-label text-[8px] opacity-60">{idea.format || t('standard')}</span>
                        </div>
                        <span className="technical-label text-[8px] opacity-20">
                          {new Date(idea.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight size={14} className="text-brand" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
