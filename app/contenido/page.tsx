'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { Instagram, Youtube, Linkedin, Music2, Plus, PenTool, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useContent } from "@/hooks/use-features-data";
import { Button } from "@/components/ui/button";
import { CreateContentDialog } from "@/components/CreateContentDialog";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

export default function ContenidoPage() {
  const { t, i18n } = useTranslation();
  const { data: content = [], isLoading } = useContent();
  const [filter, setFilter] = useState("all");
  const queryClient = useQueryClient();
  const supabase = createClient();

  const platformIcons: Record<string, any> = {
    Instagram: { icon: Instagram, label: "Instagram" },
    YouTube: { icon: Youtube, label: "YouTube" },
    LinkedIn: { icon: Linkedin, label: "LinkedIn" },
    TikTok: { icon: Music2, label: "TikTok" },
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    draft: { label: t('contenido.status.draft'), color: "text-muted-foreground bg-muted" },
    en_proceso: { label: t('contenido.status.in_proceso'), color: "text-orange-500 bg-orange-500/10" },
    published: { label: t('contenido.status.published'), color: "text-green-500 bg-green-500/10" },
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('contenido.delete_confirm'))) return;
    try {
      const { error } = await supabase.from('content').delete().eq('id', id);
      if (error) throw error;
      toast.success(t('contenido.delete_success'));
      queryClient.invalidateQueries({ queryKey: ['content'] });
    } catch (error: any) {
      toast.error(t('common.error') + ': ' + error.message);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('content').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      toast.success(t('contenido.status_updated'));
      queryClient.invalidateQueries({ queryKey: ['content'] });
    } catch (error: any) {
      toast.error(t('common.error') + ': ' + error.message);
    }
  };
  
  const filtered = filter === "all" ? content : content.filter((c: any) => c.status === filter);

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
            <h1 className="text-3xl font-bold tracking-tight">{t('contenido.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('contenido.desc')}</p>
          </div>
          <CreateContentDialog>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 font-bold px-6">
              <Plus className="h-4 w-4" />
              {t('contenido.new')}
            </Button>
          </CreateContentDialog>
        </div>

        {/* Tabs Filter */}
        <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit border border-border/50">
          {(["all", "draft", "en_proceso", "published"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-6 py-1.5 text-xs font-bold rounded-lg transition-all",
                filter === s ? "bg-blue-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s === "all" ? t('common.all') : statusConfig[s].label}
            </button>
          ))}
        </div>

        {content.length === 0 && !isLoading ? (
          <div className="py-32 text-center border-2 border-dashed border-border/10 rounded-3xl">
             <PenTool className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
             <p className="text-muted-foreground italic">{t('contenido.empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item: any) => {
              const platform = platformIcons[item.platform] || { icon: PenTool, label: item.platform };
              const status = statusConfig[item.status || 'draft'] || statusConfig['draft'];
              return (
                <div key={item.id} className="bg-card border border-border/50 rounded-2xl p-6 space-y-6 hover:border-border/30 transition-all group relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <platform.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{platform.label}</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className={cn(
                          "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest cursor-pointer hover:opacity-80 transition-opacity",
                          status.color
                        )}>
                          {status.label}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl border-border/50 bg-card/95 backdrop-blur-sm min-w-[140px]">
                        {(['draft', 'en_proceso', 'published'] as const).map((s) => (
                          <DropdownMenuItem 
                            key={s}
                            onSelect={() => handleStatusChange(item.id, s)}
                            className={cn(
                              "text-xs font-bold uppercase tracking-widest cursor-pointer rounded-lg my-1 py-2",
                              (item.status || 'draft') === s ? "bg-muted" : "hover:bg-muted/50"
                            )}
                          >
                            <span className={cn("w-2 h-2 rounded-full mr-2", statusConfig[s].color.split(' ')[1].replace('/10', '').replace('bg-muted', 'bg-muted-foreground'))} />
                            {statusConfig[s].label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <h3 className="font-bold text-lg leading-tight line-clamp-2">{item.title}</h3>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{item.type}</span>
                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                       {new Date(item.date).toLocaleDateString(i18n.language === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  {/* Hover Delete Action */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(item.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
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
