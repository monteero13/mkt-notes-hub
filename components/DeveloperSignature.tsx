import { Instagram } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeveloperSignatureProps {
  collapsed?: boolean;
}

export function DeveloperSignature({ collapsed }: DeveloperSignatureProps) {
  if (collapsed) {
    return (
      <div className="mt-auto border-t border-border p-4 flex justify-center opacity-50 hover:opacity-100 transition-opacity">
        <a href="https://instagram.com/albeertomontero_" target="_blank" rel="noopener noreferrer">
          <Instagram className="h-4 w-4 text-primary" />
        </a>
      </div>
    );
  }

  return (
    <div className="mt-auto border-t border-white/5 bg-background/30 backdrop-blur-md p-4 transition-all duration-300">
      <a
        href="https://instagram.com/albeertomontero_"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-between gap-2 rounded-xl p-2 transition-all hover:bg-white/5"
      >
        <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
          <Instagram className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-[11px] text-muted-foreground font-medium group-hover:text-foreground">
            @albeertomontero_
          </span>
        </div>
      </a>
    </div>
  );
}
