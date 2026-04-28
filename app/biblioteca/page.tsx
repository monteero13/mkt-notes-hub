'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { BookOpen, Trash2, ExternalLink, ImageIcon, FileText, Video as VideoIcon, Globe, Loader2, Plus } from "lucide-react";
import { useContent } from "@/hooks/use-features-data";
import { CreateResourceDialog } from "@/components/CreateResourceDialog";
import { Button } from "@/components/ui/button";
import { createClient } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from "react-i18next";

export default function BibliotecaPage() {
  const { t, i18n } = useTranslation();
  const { data: resources = [], isLoading } = useContent();
  const queryClient = useQueryClient();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    if (!confirm(t('biblioteca.delete_confirm'))) return;
    try {
      const { error } = await supabase.from('content').delete().eq('id', id);
      if (error) throw error;
      toast.success(t('biblioteca.delete_success'));
      queryClient.invalidateQueries({ queryKey: ['content'] });
    } catch (error: any) {
      toast.error(t('common.error') + ': ' + error.message);
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
            <h1 className="text-3xl font-bold tracking-tight">{t('biblioteca.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('biblioteca.desc')}</p>
          </div>
          <CreateResourceDialog>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 font-bold px-6">
              <Plus className="h-4 w-4" />
              {t('biblioteca.add')}
            </Button>
          </CreateResourceDialog>
        </div>

        {resources.length === 0 && !isLoading ? (
          <div className="py-32 text-center border-2 border-dashed border-border/10 rounded-3xl">
             <BookOpen className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
             <p className="text-muted-foreground italic">{t('biblioteca.empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((res: any) => (
              <div 
                key={res.id} 
                className="group bg-card border border-border/50 rounded-[2rem] overflow-hidden hover:border-border/30 transition-all flex flex-col"
              >
                {/* PREVIEW AREA */}
                <div className="aspect-square bg-muted/20 relative flex items-center justify-center border-b border-border/50 overflow-hidden">
                   {res.type === 'image' && res.url ? (
                     <img src={res.url} alt={res.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                   ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-16 w-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500">
                          {getIcon(res.type)}
                        </div>
                      </div>
                   )}

                   {/* Overlay Actions */}
                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      {res.url && (
                        <button 
                          onClick={() => window.open(res.url, '_blank')}
                          className="h-10 w-10 bg-background text-foreground rounded-xl flex items-center justify-center hover:scale-110 transition-all"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(res.id)}
                        className="h-10 w-10 bg-red-600 text-white rounded-xl flex items-center justify-center hover:scale-110 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                   </div>
                </div>

                {/* INFO AREA */}
                <div className="p-6 space-y-4">
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{res.type}</p>
                      <h4 className="font-bold text-lg leading-tight line-clamp-1">{res.title}</h4>
                   </div>
                   <div className="flex items-center justify-between pt-2">
                      <span className="text-[10px] font-bold text-muted-foreground/20 uppercase tracking-widest">
                        {new Date(res.created_at).toLocaleDateString(i18n.language === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'short' })}
                      </span>
                      <div className="h-6 w-6 flex items-center justify-center rounded-lg bg-muted">
                        {getIcon(res.type)}
                      </div>
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
