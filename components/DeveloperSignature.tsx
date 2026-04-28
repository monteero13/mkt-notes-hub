'use client';

import { Instagram } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface DeveloperSignatureProps {
  collapsed?: boolean;
}

export function DeveloperSignature({ collapsed }: DeveloperSignatureProps) {
  const { t } = useTranslation();

  if (collapsed) {
    return (
      <div className="mt-auto border-t border-border p-4 flex justify-center opacity-30 hover:opacity-100 transition-opacity">
        <a href="https://instagram.com/albeertomontero_" target="_blank" rel="noopener noreferrer">
          <Instagram className="h-3.5 w-3.5 text-muted-foreground" />
        </a>
      </div>
    );
  }

  return (
    <div className="mt-auto p-4 transition-all duration-300">
      <a
        href="https://instagram.com/albeertomontero_"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col items-center gap-1 rounded-xl p-2 transition-all"
      >
        <span className="text-[9px] text-muted-foreground/40 font-medium uppercase tracking-[0.2em]">{t('common.developed_by', 'Desarrollado por')}</span>
        <div className="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
          <Instagram className="h-3 w-3 text-foreground" />
          <span className="text-[10px] text-foreground font-bold">
            @albeertomontero_
          </span>
        </div>
      </a>
    </div>
  );
}
