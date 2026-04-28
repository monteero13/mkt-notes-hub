'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Target, Plus, TrendingUp, Loader2, Trash2, Calendar, BarChart3 } from "lucide-react";
import { useObjectives } from "@/hooks/use-features-data";
import { CreateObjectiveDialog } from "@/components/CreateObjectiveDialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function ObjetivosPage() {
  const { data: objectives = [], isLoading } = useObjectives();
  const queryClient = useQueryClient();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este objetivo estratégico?')) return;
    try {
      const { error } = await supabase.from('objectives').delete().eq('id', id);
      if (error) throw error;
      toast.success('Objetivo eliminado');
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    } catch (error: any) {
      toast.error('Error: ' + error.message);
    }
  };

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <PageHeader title="Objetivos Estratégicos" description="Establece KPIs y OKRs para medir el impacto real de tu marketing.">
          <CreateObjectiveDialog />
        </PageHeader>

        {objectives.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-card/40 border-2 border-dashed border-border/60 rounded-[3rem] text-center px-4 shadow-inner shadow-black/[0.02]">
            <div className="h-24 w-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-10 rotate-3 transition-transform">
               <Target className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-3xl font-heading font-bold mb-4 uppercase tracking-tighter">Sin objetivos fijados</h3>
            <p className="text-muted-foreground max-w-md mb-12 text-base leading-relaxed">
               Lo que no se mide no se puede mejorar. Define tus metas de crecimiento y retorno de inversión aquí.
            </p>
            
            <CreateObjectiveDialog>
              <Button size="lg" className="rounded-2xl px-12 h-14 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                Fijar primer objetivo
              </Button>
            </CreateObjectiveDialog>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {objectives.map((obj: any) => {
              const progress = obj.target_value ? Math.min(100, Math.round((obj.current_value / obj.target_value) * 100)) : 0;
              return (
                <div key={obj.id} className="group p-10 bg-card border border-border/50 rounded-[3rem] hover:shadow-2xl transition-all relative overflow-hidden">
                  <div className="absolute top-10 right-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(obj.id)}
                      className="h-9 w-9 rounded-xl bg-card border border-border shadow-sm hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-3 mb-8">
                    <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-card-foreground leading-tight">{obj.title}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{obj.kpi || 'OKR Corporativo'}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Estado Actual</p>
                        <p className="text-4xl font-black text-card-foreground tracking-tighter">{obj.current_value.toLocaleString()} <span className="text-lg text-muted-foreground/30">/ {obj.target_value.toLocaleString()}</span></p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-primary">{progress}%</span>
                      </div>
                    </div>

                    <div className="h-4 rounded-full bg-muted overflow-hidden border border-border/30 relative">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(var(--primary),0.4)]" 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 pt-6 border-t border-border/20">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        Límite: {new Date(obj.deadline).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                         <BarChart3 className="h-3.5 w-3.5" />
                         Impacto Estratégico
                      </div>
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
