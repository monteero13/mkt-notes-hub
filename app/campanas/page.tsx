'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { Plus, Loader2, Trash2, CheckCircle2, ChevronRight, X, User } from "lucide-react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { CreateCampaignDialog } from "@/components/CreateCampaignDialog";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { Button } from "@/components/ui/button";
import { createClient } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export default function CampanasPage() {
  const { t, i18n } = useTranslation();
  const { campaigns, tasks, isLoading } = useDashboardData();
  const [selectedCampId, setSelectedCampId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    if (!confirm(t('campanas.delete_confirm'))) return;
    try {
      const { error } = await supabase.from('campaigns').delete().eq('id', id);
      if (error) throw error;
      toast.success(t('campanas.delete_success'));
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      if (selectedCampId === id) setSelectedCampId(null);
    } catch (error: any) {
      toast.error(t('common.error') + ': ' + error.message);
    }
  };

  const selectedCampaign = campaigns.find(c => c.id === selectedCampId);
  const campaignTasks = tasks.filter(t => t.campaign_id === selectedCampId);

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row relative h-full min-h-[calc(100vh-12rem)]">
        {isLoading && (
          <div className="absolute inset-0 bg-background/20 backdrop-blur-sm z-50 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
          </div>
        )}
        {/* Main List */}
        <div className={cn("flex-1 p-8 space-y-8 transition-all duration-500", selectedCampId ? "lg:w-2/3" : "w-full")}>
          <div className="flex items-center justify-between">
            <PageHeader 
                title={t('campanas.title')} 
                description={t('campanas.desc')} 
            />
            <CreateCampaignDialog>
              <Button className="gap-2 font-bold">
                <Plus className="h-4 w-4" />
                {t('campanas.new')}
              </Button>
            </CreateCampaignDialog>
          </div>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20 text-xs font-medium text-muted-foreground">
                   <th className="px-6 py-4">{t('campanas.table.name')}</th>
                   <th className="px-6 py-4">{t('campanas.table.start')}</th>
                   <th className="px-6 py-4">{t('campanas.table.end')}</th>
                   <th className="px-6 py-4">{t('campanas.table.progress')}</th>
                   <th className="px-6 py-4 text-right">{t('campanas.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {campaigns.length > 0 ? campaigns.map((c) => (
                  <tr 
                    key={c.id} 
                    onClick={() => setSelectedCampId(c.id)}
                    className={cn(
                      "group hover:bg-muted/50 cursor-pointer transition-colors",
                      selectedCampId === c.id && "bg-primary/5"
                    )}
                  >
                    <td className="px-6 py-5 font-medium">{c.name}</td>
                    <td className="px-6 py-5 text-sm text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString(i18n.language === 'es' ? 'es-ES' : 'en-US', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </td>
                    <td className="px-6 py-5 text-sm text-muted-foreground">--/--/--</td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-3 w-32">
                         <Progress value={c.progress} className="h-2" />
                         <span className="text-xs font-medium">{c.progress}%</span>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <div className="flex items-center justify-end gap-2">
                         <div className="h-8 w-8 flex items-center justify-center rounded-md bg-muted border border-border">
                           <User className="h-4 w-4 text-muted-foreground" />
                         </div>
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                           className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground text-sm">
                      {t('campanas.empty')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Drill-down: Tasks */}
        {selectedCampId && selectedCampaign && (
          <div className="w-full lg:w-[400px] border-l border-border/50 bg-card/50 backdrop-blur-sm p-8 flex flex-col animate-in slide-in-from-right duration-500">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold">{selectedCampaign.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {campaignTasks.length} {t('campanas.tasks_associated')}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedCampId(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <CreateTaskDialog defaultCampaignId={selectedCampaign.id}>
                <Button variant="outline" className="w-full gap-2 border-dashed border-2">
                  <Plus className="h-4 w-4" />
                  {t('campanas.add_task')}
                </Button>
              </CreateTaskDialog>

              <div className="space-y-2 pt-4">
                {campaignTasks.length > 0 ? campaignTasks.map((t) => (
                  <div key={t.id} className="p-3 bg-background border border-border/50 rounded-lg flex items-center justify-between group/task hover:border-border transition-colors">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className={cn("h-4 w-4", t.completed ? "text-green-500" : "text-muted-foreground/30")} />
                      <span className={cn("text-sm font-medium", t.completed && "line-through text-muted-foreground")}>{t.title}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover/task:text-muted-foreground transition-colors" />
                  </div>
                )) : (
                  <div className="py-10 text-center border-2 border-dashed border-border/50 rounded-lg text-muted-foreground text-sm">
                    {t('campanas.no_tasks')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
