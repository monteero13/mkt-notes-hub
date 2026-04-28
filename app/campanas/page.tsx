'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Plus, Rocket, Inbox, Loader2, Trash2, CheckCircle2, ListTodo, Info, Zap } from "lucide-react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { CreateCampaignDialog } from "@/components/CreateCampaignDialog";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { Button } from "@/components/ui/button";
import { createClient } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function CampanasPage() {
  const { campaigns, tasks, isLoading } = useDashboardData();
  const queryClient = useQueryClient();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta campaña? Se borrarán sus misiones asociadas.')) return;
    try {
      const { error } = await supabase.from('campaigns').delete().eq('id', id);
      if (error) throw error;
      toast.success('Campaña eliminada correctamente');
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    } catch (error: any) {
      toast.error('Error al eliminar: ' + error.message);
    }
  };

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <PageHeader title="Control de Campañas" description="Gestiona tus estrategias y sus misiones tácticas asociadas.">
          <CreateCampaignDialog />
        </PageHeader>

        {/* Tactical Info Banner */}
        <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-6 flex items-center gap-6 shadow-sm">
           <div className="h-12 w-12 bg-primary/10 rounded-[1.5rem] flex items-center justify-center shrink-0">
              <Zap className="h-6 w-6 text-primary" />
           </div>
           <div className="space-y-1">
             <p className="font-bold text-sm text-card-foreground uppercase tracking-tight">Sincronización Estratégica</p>
             <p className="text-xs text-muted-foreground/80 leading-relaxed">
                Añade <strong>Misiones Tácticas</strong> directamente a tus campañas. El progreso se actualizará solo.
             </p>
           </div>
        </div>

        {campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-muted/20 border-2 border-dashed border-border/60 rounded-[3rem] text-center px-4">
            <div className="h-24 w-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-10 rotate-3">
              <Rocket className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-3xl font-heading font-bold mb-4 uppercase tracking-tighter">Sin campañas activas</h3>
            <p className="text-muted-foreground max-w-sm mb-12 text-base">Inicia una estrategia para desbloquear el seguimiento masivo de resultados.</p>
            
            <CreateCampaignDialog>
              <Button size="lg" className="rounded-2xl px-12 h-14 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                Crear primera campaña
              </Button>
            </CreateCampaignDialog>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            {campaigns.map((c: any) => {
              const campaignTasks = tasks.filter((t: any) => t.campaign_id === c.id);
              return (
                <div key={c.id} className="group rounded-[3rem] border border-border/50 bg-card p-10 transition-all hover:shadow-2xl hover:bg-muted/5 relative overflow-hidden flex flex-col h-full">
                  
                  {/* Header */}
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <span className="px-4 py-1.5 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10 mb-4 inline-block">
                        {c.channel || 'Estrategia'}
                      </span>
                      <h3 className="text-3xl font-black text-card-foreground leading-tight tracking-tighter">{c.name}</h3>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(c.id)}
                      className="h-10 w-10 border border-border/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/5"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Progress Section */}
                  <div className="space-y-4 mb-10 bg-muted/20 p-6 rounded-[2rem] border border-border/30">
                    <div className="flex justify-between items-center px-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Progreso Automático</p>
                      <p className="text-2xl font-black text-primary tracking-tighter">{c.progress || 0}%</p>
                    </div>
                    <div className="h-4 rounded-full bg-muted overflow-hidden border border-border/10 relative">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(var(--primary),0.3)]" 
                        style={{ width: `${c.progress || 0}%` }} 
                      />
                    </div>
                  </div>

                  {/* Missions List */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between px-1">
                       <div className="flex items-center gap-2">
                          <ListTodo className="h-4 w-4 text-muted-foreground/40" />
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Misiones Vinculadas ({campaignTasks.length})</h4>
                       </div>
                    </div>

                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                       {campaignTasks.length > 0 ? (
                         campaignTasks.map((t: any) => (
                           <div key={t.id} className="flex items-center gap-3 p-4 bg-muted/10 border border-border/20 rounded-2xl group/item">
                              <CheckCircle2 className={`h-4 w-4 ${t.status === 'completed' ? 'text-green-500' : 'text-muted-foreground/20'}`} />
                              <span className={`text-xs font-bold ${t.status === 'completed' ? 'line-through text-muted-foreground' : 'text-card-foreground'}`}>
                                {t.title}
                              </span>
                           </div>
                         ))
                       ) : (
                         <div className="py-10 text-center border-2 border-dashed border-border/30 rounded-[2rem]">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">Sin misiones tácticas</p>
                         </div>
                       )}
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="mt-10 pt-6 border-t border-border/10 flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 italic">Lanzado {new Date(c.created_at).toLocaleDateString()}</span>
                    <CreateTaskDialog defaultCampaignId={c.id}>
                       <Button size="sm" variant="outline" className="rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all gap-2">
                          <Plus className="h-3 w-3" /> Añadir Misión
                       </Button>
                    </CreateTaskDialog>
                  </div>

                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
