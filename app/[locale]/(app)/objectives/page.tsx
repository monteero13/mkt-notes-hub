'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { Target, Plus, TrendingUp, Loader2, Trash2, Calendar, ChevronRight, ArrowUpRight, Hash } from "lucide-react";
import { useObjectives } from "@/hooks/use-features-data";
import { CreateObjectiveDialog } from "@/components/CreateObjectiveDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function ObjetivosPage() {
  const { data: objectives = [], isLoading } = useObjectives();
  const queryClient = useQueryClient();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('objectives').delete().eq('id', id);
      if (error) throw error;
      toast.success("Objetivo eliminado");
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    } catch (error: any) {
      toast.error("Error" + ': ' + error.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-background">
        {/* Top Operational Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="technical-label text-[11px] text-foreground">Performance Dashboard</div>
            <div className="h-4 w-[1px] bg-border" />
            <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              <span>Objectives</span>
              <ChevronRight size={12} className="opacity-30" />
              <span className="text-brand">Strategic Targets</span>
            </div>
          </div>
          <CreateObjectiveDialog>
            <Button className="h-8 rounded-sm bg-brand px-4 technical-label text-[10px] text-white hover:opacity-90">
              <Plus className="mr-2 h-3 w-3" />
              Define Target
            </Button>
          </CreateObjectiveDialog>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
          {isLoading ? (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-brand/20" />
              <span className="technical-label text-[9px]">Calculating Strategic Trajectory...</span>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <div className="flex flex-col gap-1">
                <div className="technical-label text-brand">Business Intelligence</div>
                <h1 className="text-4xl font-light tracking-tight" style={{ fontFamily: "var(--font-clash), sans-serif" }}>Objectives Matrix</h1>
              </div>

              {objectives.length === 0 ? (
                <div className="h-[40vh] border border-dashed border-border flex flex-col items-center justify-center rounded-sm bg-accent/5">
                  <Target className="h-10 w-10 text-muted-foreground/10 mb-4" />
                  <span className="technical-label text-[10px] opacity-40 uppercase tracking-widest">No strategic targets defined.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                  {objectives.map((obj: any) => {
                    const progress = obj.target_value ? Math.min(100, Math.round((obj.current_value / obj.target_value) * 100)) : 0;
                    return (
                      <div
                        key={obj.id}
                        className="group relative border border-border bg-card p-4 sm:p-6 rounded-[4px] shadow-sm hover:border-brand transition-all flex flex-col gap-4 sm:gap-6 lg:gap-8 overflow-hidden"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <TrendingUp size={12} className="text-brand" />
                              <span className="technical-label text-[8px] opacity-40 uppercase tracking-widest">{obj.kpi || 'MARKETING KPI'}</span>
                            </div>
                            <h3 className="text-xl font-light tracking-tight text-foreground group-hover:text-brand transition-colors normal-case leading-none" style={{ fontFamily: "var(--font-clash), sans-serif" }}>
                              {obj.title}
                            </h3>
                          </div>
                          <DeleteConfirmDialog
                            onConfirm={() => handleDelete(obj.id)}
                            title="Purge Strategic Objective"
                          >
                            <button className="p-1 text-muted-foreground/10 hover:text-error transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </DeleteConfirmDialog>
                        </div>

                        <div className="space-y-6">
                          <div className="flex justify-between items-end">
                            <div className="space-y-1">
                              <div className="text-4xl font-black contundente-number tracking-tighter leading-none">
                                {obj.current_value.toLocaleString()}
                              </div>
                              <div className="technical-label text-[8px] opacity-30 uppercase tracking-widest">
                                Target Protocol: {obj.target_value.toLocaleString()}
                              </div>
                            </div>
                            <div className="text-2xl font-black contundente-number text-brand leading-none">
                              {progress}%
                            </div>
                          </div>
                          <Progress value={progress} className="h-1 rounded-full bg-accent/10" />
                        </div>

                        <div className="pt-6 border-t border-border flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar size={12} className="text-muted-foreground/30" />
                            <span className="technical-label text-[8px] opacity-40 uppercase tracking-widest">
                              Deadline: {obj.due_date ? new Date(obj.due_date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                            </span>
                          </div>
                          <CreateTaskDialog>
                            <Button className="h-7 rounded-sm bg-accent/5 border border-border px-3 technical-label text-[8px] text-foreground hover:bg-brand/10 hover:text-brand hover:border-brand transition-all">
                              Deploy Task Unit
                            </Button>
                          </CreateTaskDialog>
                        </div>

                        <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowUpRight size={14} className="text-brand" />
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
