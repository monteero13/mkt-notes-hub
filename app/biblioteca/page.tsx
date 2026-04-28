'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { BookOpen, Trash2, Download, ExternalLink, ImageIcon, FileText, Video as VideoIcon, Globe, Loader2 } from "lucide-react";
import { useContent } from "@/hooks/use-features-data";
import { CreateResourceDialog } from "@/components/CreateResourceDialog";
import { Button } from "@/components/ui/button";
import { createClient } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function BibliotecaPage() {
  const { data: resources = [], isLoading } = useContent();
  const queryClient = useQueryClient();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este recurso?')) return;
    try {
      const { error } = await supabase.from('content').delete().eq('id', id);
      if (error) throw error;
      toast.success('Recurso eliminado');
      queryClient.invalidateQueries({ queryKey: ['content'] });
    } catch (error: any) {
      toast.error('Error al eliminar: ' + error.message);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="h-4 w-4" />;
      case 'video': return <VideoIcon className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
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
      <div className="space-y-8 p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto">
        <PageHeader title="Biblioteca de Activos" description="Tu hub central de inspiración, branding y recursos multimedia.">
          <CreateResourceDialog />
        </PageHeader>

        {resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 bg-muted/10 border-2 border-dashed border-border/40 rounded-[4rem] text-center px-4 transition-all hover:bg-muted/20">
            <div className="h-24 w-24 bg-card rounded-[2.5rem] flex items-center justify-center mb-8 rotate-6 shadow-xl shadow-black/5 ring-1 ring-border/50">
              <BookOpen className="h-10 w-10 text-primary/40" />
            </div>
            <h3 className="text-3xl font-black tracking-tighter text-card-foreground mb-4 uppercase">Biblioteca Vacía</h3>
            <p className="text-muted-foreground/60 max-w-sm mb-12 text-sm font-medium">Comienza a archivar logos, referencias de Reels o manuales de marca para centralizar tu estrategia.</p>
            <CreateResourceDialog />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {resources.map((res: any) => (
              <div 
                key={res.id} 
                className="group relative flex flex-col bg-card rounded-[2.5rem] border border-border/50 overflow-hidden transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2"
              >
                {/* PREVIEW AREA */}
                <div className="aspect-[4/3] bg-muted/30 relative flex items-center justify-center overflow-hidden border-b border-border/20">
                   {res.type === 'image' && res.url ? (
                     <img src={res.url} alt={res.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                   ) : (
                     <div className="flex flex-col items-center gap-4">
                        <div className={`h-16 w-16 rounded-[2rem] flex items-center justify-center shadow-lg ${
                          res.type === 'video' ? 'bg-orange-500/10 text-orange-500' : 
                          res.type === 'document' ? 'bg-blue-500/10 text-blue-500' : 'bg-primary/10 text-primary'
                        }`}>
                           {getIcon(res.type)}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{res.type}</span>
                     </div>
                   )}

                   {/* Overlay Actions */}
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                      {res.url && (
                        <Button 
                          size="icon" 
                          variant="secondary" 
                          className="rounded-2xl h-12 w-12 shadow-xl hover:scale-110 transition-all"
                          onClick={() => window.open(res.url, '_blank')}
                        >
                          {res.url.startsWith('http') ? <ExternalLink className="h-5 w-5" /> : <Download className="h-5 w-5" />}
                        </Button>
                      )}
                      <Button 
                        size="icon" 
                        variant="destructive" 
                        className="rounded-2xl h-12 w-12 shadow-xl hover:scale-110 transition-all"
                        onClick={() => handleDelete(res.id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                   </div>
                </div>

                {/* INFO AREA */}
                <div className="p-6">
                   <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                         <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-1">{res.platform || 'Activo Digital'}</p>
                         <h4 className="font-black text-card-foreground text-sm truncate uppercase tracking-tight">{res.title}</h4>
                      </div>
                      <div className="p-2 bg-muted/50 rounded-xl">
                        {getIcon(res.type)}
                      </div>
                   </div>
                   <div className="mt-4 flex items-center gap-2">
                      <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest italic leading-none">Guardado el {new Date(res.created_at).toLocaleDateString()}</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
