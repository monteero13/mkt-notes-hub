'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { Target, Plus, TrendingUp, Loader2, Trash2, Calendar } from "lucide-react";
import { useObjectives } from "@/hooks/use-features-data";
import { CreateObjectiveDialog } from "@/components/CreateObjectiveDialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";

export default function ObjetivosPage() {
  const { t, i18n } = useTranslation();
  const { data: objectives = [], isLoading } = useObjectives();
  const queryClient = useQueryClient();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    if (!confirm(t('objetivos.delete_confirm'))) return;
    try {
      const { error } = await supabase.from('objectives').delete().eq('id', id);
      if (error) throw error;
      toast.success(t('objetivos.delete_success'));
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
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
            <h1 className="text-3xl font-bold tracking-tight">{t('objetivos.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('objetivos.desc')}</p>
          </div>
          <CreateObjectiveDialog>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 font-bold px-6">
              <Plus className="h-4 w-4" />
              {t('objetivos.new')}
            </Button>
          </CreateObjectiveDialog>
        </div>

        {objectives.length === 0 && !isLoading ? (
          <div className="py-32 text-center border-2 border-dashed border-border/10 rounded-3xl">
             <Target className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
             <p className="text-muted-foreground italic">{t('objetivos.empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {objectives.map((obj: any) => {
              const progress = obj.target_value ? Math.min(100, Math.round((obj.current_value / obj.target_value) * 100)) : 0;
              return (
                <div key={obj.id} className="bg-card border border-border/50 rounded-[2rem] p-8 space-y-8 hover:border-border/30 transition-all group relative">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{obj.kpi || 'Marketing KPI'}</span>
                      </div>
                      <h3 className="text-2xl font-bold tracking-tight">{obj.title}</h3>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(obj.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-4xl font-bold tracking-tight">{obj.current_value.toLocaleString()}</p>
                        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-widest">{t('objetivos.target_label')}: {obj.target_value.toLocaleString()}</p>
                      </div>
                      <span className="text-2xl font-bold text-blue-500">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-3 rounded-full" />
                  </div>

                  <div className="flex items-center gap-6 pt-4 border-t border-border/5">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                        {new Date(obj.deadline).toLocaleDateString(i18n.language === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
