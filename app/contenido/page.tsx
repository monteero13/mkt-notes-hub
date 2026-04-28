'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Instagram, Youtube, Linkedin, Music2, Plus, PenTool, Loader2, Trash2, Calendar } from "lucide-react";
import { useState } from "react";
import { useContent } from "@/hooks/use-features-data";
import { Button } from "@/components/ui/button";
import { CreateContentDialog } from "@/components/CreateContentDialog";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const platformIcons: Record<string, React.ElementType> = {
  Instagram,
  YouTube: Youtube,
  LinkedIn: Linkedin,
  TikTok: Music2,
};

const statusConfig: Record<string, { label: string; classes: string }> = {
  idea: { label: "Idea", classes: "bg-muted text-muted-foreground" },
  en_proceso: { label: "En proceso", classes: "bg-orange-500/15 text-orange-600" },
  published: { label: "Publicado", classes: "bg-green-500/15 text-green-600" },
};

export default function ContenidoPage() {
  const { data: content = [], isLoading } = useContent();
  const [filter, setFilter] = useState("all");
  const queryClient = useQueryClient();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta pieza de contenido?')) return;
    try {
      const { error } = await supabase.from('content').delete().eq('id', id);
      if (error) throw error;
      toast.success('Contenido eliminado');
      queryClient.invalidateQueries({ queryKey: ['content'] });
    } catch (error: any) {
      toast.error('Error: ' + error.message);
    }
  };
  
  const filtered = filter === "all" ? content : content.filter((c: any) => c.status === filter);

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
        <PageHeader title="Plan Editorial" description="Organiza tu presencia de marca en redes sociales y canales digitales.">
          <CreateContentDialog />
        </PageHeader>

        {content.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-card/40 border-2 border-dashed border-border/60 rounded-[3rem] text-center px-4 shadow-inner shadow-black/[0.02]">
            <div className="h-24 w-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-10 rotate-3 transition-transform">
               <PenTool className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-3xl font-heading font-bold mb-4 uppercase tracking-tighter">Sin contenido planificado</h3>
            <p className="text-muted-foreground max-w-sm mb-12 text-base leading-relaxed">
              Centraliza la planificación de tus piezas multicanal aquí para asegurar una presencia de marca constante.
            </p>
            
            <CreateContentDialog>
              <Button size="lg" className="rounded-2xl px-12 h-14 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                Crear primera pieza
              </Button>
            </CreateContentDialog>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-8">
              {(["all", "idea", "en_proceso", "published"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest border transition-all ${
                    filter === s ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-card text-muted-foreground border-border hover:bg-accent"
                  }`}
                >
                  {s === "all" ? "Todos" : statusConfig[s].label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((item: any) => {
                const PlatformIcon = platformIcons[item.platform] || PenTool;
                const status = statusConfig[item.status || 'idea'];
                return (
                  <div key={item.id} className="group rounded-[2.5rem] border border-border/50 bg-card hover:bg-muted/10 p-8 transition-all hover:shadow-2xl relative">
                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(item.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-start justify-between mb-8">
                      <div className="h-12 w-12 bg-primary/5 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <PlatformIcon className="h-6 w-6 text-primary" />
                      </div>
                      <span className={`rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest border ${status.classes}`}>
                        {status.label}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-card-foreground leading-tight mb-8 line-clamp-2">{item.title}</h3>
                    
                    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.1em] text-muted-foreground border-t border-border/20 pt-6">
                      <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                         {item.type}
                      </div>
                      <div className="flex items-center gap-1.5 opacity-60">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
