"use client";

import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { CreateResourceDialog } from '@/components/CreateResourceDialog';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useContent } from '@/hooks/use-features-data';
import { createClient } from '@/lib/supabase/client';
import { useTranslations } from 'next-intl';
import {
  Loader2,
  ArrowUpRight,
  Trash2,
  BookOpen,
  ExternalLink,
  ChevronRight,
  Plus,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  Globe
} from 'lucide-react';

export default function BibliotecaPage() {
  const { data: resources = [], isLoading } = useContent();
  const queryClient = useQueryClient();
  const supabase = createClient();
  const t = useTranslations('library');
  const tCommon = useTranslations('common');

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('content_items').delete().eq('id', id);
      if (error) throw error;
      toast.success(t('delete_success'));
      queryClient.invalidateQueries({ queryKey: ['content'] });
    } catch (error: any) {
      toast.error(tCommon('error') + ': ' + error.message);
    }
  };

  const getThumbnail = (url: string, type: string) => {
    if (!url) return null;
    if (type === 'image') return url;
    try {
      const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      if (ytMatch) return `https://i.ytimg.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
      if (url.includes('instagram.com') || url.includes('tiktok.com')) {
        return `https://api.microlink.io?url=${encodeURIComponent(url)}&screenshot=true&embed=screenshot.url`;
      }
      if (url.startsWith('http')) {
        return `https://api.microlink.io?url=${encodeURIComponent(url)}&image=true&embed=image.url`;
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon size={14} />;
      case 'video': return <VideoIcon size={14} />;
      case 'document': return <FileText size={14} />;
      default: return <Globe size={14} />;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-background">
        {/* Top Control Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="technical-label text-[11px] text-foreground">{t('asset_repository')}</div>
            <div className="h-4 w-[1px] bg-border" />
            <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              <span>{t('library')}</span>
              <ChevronRight size={12} className="opacity-60" />
              <span className="text-brand">{t('resource_vault')}</span>
            </div>
          </div>
          <CreateResourceDialog>
            <Button className="h-8 rounded-sm bg-brand px-4 technical-label text-[10px] text-white hover:opacity-90">
              <Plus className="mr-2 h-3 w-3" />
              {t('ingest_asset')}
            </Button>
          </CreateResourceDialog>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
          {isLoading ? (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-brand/40" />
              <span className="technical-label text-[9px]">{t('decrypting_vault')}</span>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <div className="flex flex-col gap-1">
                <div className="technical-label text-brand">{t('knowledge_management')}</div>
                <h1 className="text-4xl font-light tracking-tight" style={{ fontFamily: "var(--font-clash), sans-serif" }}>{t('resource_vault')}</h1>
              </div>

              {(!resources || resources.length === 0) ? (
                <div className="h-[40vh] border border-dashed border-border flex flex-col items-center justify-center rounded-sm bg-accent/5">
                  <BookOpen className="h-10 w-10 text-muted-foreground/30 mb-4" />
                  <span className="technical-label text-[10px] opacity-60 uppercase tracking-widest">{t('vault_empty')}</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                  {resources?.map((res: any) => {
                    const thumbnail = getThumbnail(res.url, res.type);
                    return (
                      <div
                        key={res.id}
                        className="group relative border border-border bg-card rounded-sm overflow-hidden hover:border-brand transition-all flex flex-col shadow-sm"
                      >
                        {/* Preview Area */}
                        <div className="aspect-[16/10] bg-accent/5 relative flex items-center justify-center overflow-hidden border-b border-border">
                          {thumbnail ? (
                            <img src={thumbnail} alt={res.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500" />
                          ) : (
                            <div className="text-muted-foreground/30 group-hover:text-brand/60 transition-all">
                              {getIcon(res.type)}
                            </div>
                          )}

                          {/* Overlay Actions */}
                          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                            {res.url && (
                              <button
                                onClick={() => window.open(res.url, '_blank')}
                                className="h-9 w-9 rounded-sm bg-brand text-white flex items-center justify-center hover:scale-105 transition-transform"
                              >
                                <ExternalLink size={16} />
                              </button>
                            )}
                            <DeleteConfirmDialog onConfirm={() => handleDelete(res.id)} title={t('purge_asset')}>
                              <button className="h-9 w-9 rounded-sm bg-error text-white flex items-center justify-center hover:scale-105 transition-transform">
                                <Trash2 size={16} />
                              </button>
                            </DeleteConfirmDialog>
                          </div>

                          <div className="absolute top-4 left-4 h-8 w-8 rounded-sm bg-background border border-border flex items-center justify-center text-muted-foreground/60 group-hover:text-brand group-hover:border-brand transition-all">
                            {getIcon(res.type)}
                          </div>
                        </div>

                        {/* Info Area */}
                        <div className="p-5 flex flex-col flex-1 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="technical-label text-[8px] px-1.5 py-0.5 rounded-sm bg-brand/5 text-brand border border-brand/10">
                                {res.platform || res.type}
                              </span>
                              <span className="technical-label text-[8px] opacity-40 uppercase tracking-widest">
                                ID-{res.id.slice(0, 4)}
                              </span>
                            </div>
                            <h4 className="font-black text-[11px] uppercase tracking-tight text-foreground leading-normal line-clamp-2 group-hover:text-brand transition-colors">
                              {res.title}
                            </h4>
                          </div>
                          <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                            <span className="technical-label text-[8px] opacity-60">
                              {new Date(res.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <ArrowUpRight size={12} className="text-brand opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
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
