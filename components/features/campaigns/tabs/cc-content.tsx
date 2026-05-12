import { ContentItem } from "@/types";
import { FileText, Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { format } from "date-fns";
import { CreateContentDialog } from "@/components/CreateContentDialog";

interface Props {
  content: ContentItem[];
  campaignId?: string;
}

const STATUS_STYLE: Record<string, string> = {
  idea:       "bg-slate-500/10 text-slate-400 border-slate-500/20",
  drafting:   "bg-blue-500/10 text-blue-400 border-blue-500/20",
  in_review:  "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  approved:   "bg-brand/10 text-brand border-brand/20",
  scheduled:  "bg-purple-500/10 text-purple-400 border-purple-500/20",
  published:  "bg-green-500/10 text-green-400 border-green-500/20",
  archived:   "bg-red-500/10 text-red-400 border-red-500/20",
};

const STATUS_LABEL: Record<string, string> = {
  idea: "Idea", drafting: "Borrador", in_review: "En Revisión",
  approved: "Aprobado", scheduled: "Programado", published: "Publicado", archived: "Archivado",
};

const CHANNEL_LABEL: Record<string, string> = {
  instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube",
  linkedin: "LinkedIn", facebook: "Facebook", twitter: "Twitter",
  email: "Email", blog: "Blog", other: "Otro",
};

export function CcContent({ content, campaignId }: Props) {
  if (content.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center rounded-xl border border-dashed border-border space-y-4">
        <FileText size={32} className="text-muted-foreground/20" />
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Sin piezas de contenido</p>
          <p className="text-xs text-muted-foreground/50 mt-1">
            Comienza a planificar y calendarizar publicaciones para esta campaña.
          </p>
        </div>
        <CreateContentDialog campaignId={campaignId}>
          <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-brand rounded-sm hover:opacity-90 active:scale-95 transition-all">
            <Plus size={14} />
            Crear Contenido
          </button>
        </CreateContentDialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-border">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Plan de Contenido</h2>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Planificación editorial y publicaciones de campaña</p>
        </div>
        <CreateContentDialog campaignId={campaignId}>
          <button className="flex items-center gap-2 px-3 h-8 text-[10px] font-black uppercase tracking-widest text-white bg-brand rounded-sm hover:opacity-90 active:scale-95 transition-all">
            <Plus size={12} />
            Crear Contenido
          </button>
        </CreateContentDialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {content.map((item) => (
          <div
            key={item.id}
            className="border border-border bg-card rounded-xl p-5 space-y-3 hover:border-brand/30 transition-colors group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm border",
                  STATUS_STYLE[item.status] ?? STATUS_STYLE.idea
                )}>
                  {STATUS_LABEL[item.status] ?? item.status}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground/50 uppercase">
                  {CHANNEL_LABEL[item.channel] ?? item.channel}
                </span>
              </div>
            </div>

            <p className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-brand transition-colors">
              {item.title}
            </p>

            {item.copy && (
              <p className="text-xs text-muted-foreground/70 line-clamp-2 leading-relaxed">{item.copy}</p>
            )}

            {item.cta && (
              <p className="text-[10px] font-bold text-brand/70 uppercase tracking-wider">CTA: {item.cta}</p>
            )}

            <div className="pt-2 border-t border-border/50 flex items-center justify-between">
              {item.scheduled_at ? (
                <span className="text-[10px] text-muted-foreground/50">
                  📅 {format(new Date(item.scheduled_at), "d MMM yyyy")}
                </span>
              ) : (
                <span className="text-[10px] text-muted-foreground/30">Sin programar</span>
              )}
              {item.hashtags && item.hashtags.length > 0 && (
                <span className="text-[10px] text-muted-foreground/40">
                  #{item.hashtags.length} tags
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
