'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Lightbulb, Plus, MoreHorizontal, Loader2, Trash2, Tag, Layers } from "lucide-react";
import { useIdeas } from "@/hooks/use-features-data";
import { CreateIdeaDialog } from "@/components/CreateIdeaDialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function IdeasPage() {
  const { data: ideas = [], isLoading } = useIdeas();
  const queryClient = useQueryClient();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta idea del banco?')) return;
    try {
      const { error } = await supabase.from('ideas').delete().eq('id', id);
      if (error) throw error;
      toast.success('Idea eliminada');
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
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
        <PageHeader title="Banco de Ideas" description="Captura tendencias y conceptos creativos antes de que se escapen.">
          <CreateIdeaDialog />
        </PageHeader>

        {ideas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-card/40 border-2 border-dashed border-border/60 rounded-[3rem] text-center px-4 shadow-inner shadow-black/[0.02]">
            <div className="h-24 w-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-10 rotate-3 transition-transform">
               <Lightbulb className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-3xl font-heading font-bold mb-4 uppercase tracking-tighter">Sin ideas capturadas</h3>
            <p className="text-muted-foreground max-w-md mb-12 text-base leading-relaxed">
              El Banco de Ideas es tu espacio para la creatividad sin filtros. Captura aquí cualquier concepto para futuras campañas.
            </p>
            
            <CreateIdeaDialog>
              <Button size="lg" className="rounded-2xl px-12 h-14 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                Capturar primera idea
              </Button>
            </CreateIdeaDialog>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideas.map((idea: any) => (
              <div key={idea.id} className="group p-8 bg-card border border-border/50 rounded-[2.5rem] hover:shadow-2xl hover:bg-muted/10 transition-all relative">
                <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(idea.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                  <Tag className="h-3 w-3" />
                  {idea.category || 'Creatividad'}
                </div>

                <h3 className="text-2xl font-black text-card-foreground leading-tight mb-8 pr-10">{idea.title}</h3>
                
                <div className="flex flex-wrap gap-4 items-center justify-between pt-6 border-t border-border/20">
                   <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                     <Layers className="h-3.5 w-3.5" />
                     {idea.format || 'Multiformato'}
                   </div>
                   <span className="text-[10px] font-medium text-muted-foreground/30">{new Date(idea.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
