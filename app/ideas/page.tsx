'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { Lightbulb, Plus, Loader2, Trash2, Layers } from "lucide-react";
import { useIdeas } from "@/hooks/use-features-data";
import { CreateIdeaDialog } from "@/components/CreateIdeaDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function IdeasPage() {
  const { t, i18n } = useTranslation();
  const { data: ideas = [], isLoading } = useIdeas();
  const queryClient = useQueryClient();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('ideas').delete().eq('id', id);
      if (error) throw error;
      toast.success(t('ideas.delete_success'));
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
    } catch (error: any) {
      toast.error(t('common.error') + ': ' + error.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/20 backdrop-blur-[2px] z-50 flex items-center justify-center min-h-[70vh] rounded-[2.5rem]">
            <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">{t('ideas.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('ideas.desc')}</p>
          </div>
          <CreateIdeaDialog>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 font-bold px-6">
              <Plus className="h-4 w-4" />
              {t('ideas.new')}
            </Button>
          </CreateIdeaDialog>
        </div>

        {ideas.length === 0 && !isLoading ? (
          <div className="py-32 text-center border-2 border-dashed border-border/10 rounded-3xl">
            <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground italic">{t('ideas.empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideas.map((idea: any) => (
              <div key={idea.id} className="bg-card border border-border/50 rounded-[2rem] p-8 flex flex-col justify-between hover:border-border/30 transition-all group relative">
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DeleteConfirmDialog 
                    onConfirm={() => handleDelete(idea.id)}
                    title={t('ideas.delete_confirm_title', '¿Eliminar idea?')}
                    description={t('ideas.delete_confirm_desc', '¿Estás seguro de que quieres eliminar esta idea creativa?')}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DeleteConfirmDialog>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{idea.category || t('ideas.category_default')}</span>
                  </div>

                  <h3 className="text-2xl font-bold leading-tight">{idea.title}</h3>
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-border/5 mt-8">
                  <div className="flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5 text-muted-foreground/40" />
                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{idea.format || t('ideas.format_default')}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground/30 font-bold">
                    {new Date(idea.created_at).toLocaleDateString(i18n.language === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
