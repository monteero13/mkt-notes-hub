import { Resource } from "@/types";
import { FileImage, FileVideo, FileText, File, Archive, FolderOpen, Plus } from "lucide-react";
import { format } from "date-fns";
import { CreateResourceDialog } from "@/components/CreateResourceDialog";

interface Props {
  assets: Resource[];
  campaignId?: string;
}

const TYPE_ICON: Record<string, React.ElementType> = {
  image:    FileImage,
  video:    FileVideo,
  pdf:      FileText,
  document: FileText,
  zip:      Archive,
  other:    File,
};

const TYPE_LABEL: Record<string, string> = {
  image: "Imagen", video: "Vídeo", pdf: "PDF",
  document: "Documento", zip: "Archivo ZIP", other: "Otro",
};

const TYPE_COLOR: Record<string, string> = {
  image:    "text-pink-400 bg-pink-500/10 border-pink-500/20",
  video:    "text-blue-400 bg-blue-500/10 border-blue-500/20",
  pdf:      "text-red-400 bg-red-500/10 border-red-500/20",
  document: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  zip:      "text-purple-400 bg-purple-500/10 border-purple-500/20",
  other:    "text-muted-foreground bg-accent/10 border-border",
};

function formatBytes(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CcAssets({ assets, campaignId }: Props) {
  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center rounded-xl border border-dashed border-border space-y-4">
        <FolderOpen size={32} className="text-muted-foreground/20" />
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Sin assets adjuntos</p>
          <p className="text-xs text-muted-foreground/50 mt-1">
            Comienza a subir imágenes, vídeos, copys o enlaces para esta campaña.
          </p>
        </div>
        <CreateResourceDialog campaignId={campaignId}>
          <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-brand rounded-sm hover:opacity-90 active:scale-95 transition-all">
            <Plus size={14} />
            Añadir Asset
          </button>
        </CreateResourceDialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-border">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Biblioteca de Assets</h2>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Recursos creativos, copys y documentos de campaña</p>
        </div>
        <CreateResourceDialog campaignId={campaignId}>
          <button className="flex items-center gap-2 px-3 h-8 text-[10px] font-black uppercase tracking-widest text-white bg-brand rounded-sm hover:opacity-90 active:scale-95 transition-all">
            <Plus size={12} />
            Añadir Asset
          </button>
        </CreateResourceDialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset) => {
          const Icon = TYPE_ICON[asset.file_type] ?? File;
          const color = TYPE_COLOR[asset.file_type] ?? TYPE_COLOR.other;
          return (
            <a
              key={asset.id}
              href={asset.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-border bg-card rounded-xl p-5 flex items-start gap-4 hover:border-brand/30 transition-colors group animate-fade-in"
            >
              <div className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-sm font-semibold text-foreground truncate group-hover:text-brand transition-colors">
                  {asset.name}
                </p>
                <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">
                  {TYPE_LABEL[asset.file_type]} · {formatBytes(asset.size_bytes)}
                </p>
                {asset.description && (
                  <p className="text-xs text-muted-foreground/60 line-clamp-1">{asset.description}</p>
                )}
                <p className="text-[10px] text-muted-foreground/30">
                  {format(new Date(asset.created_at), "d MMM yyyy")}
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
