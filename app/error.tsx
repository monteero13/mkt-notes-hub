"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background p-8 text-center">
      <div className="h-16 w-16 rounded-sm bg-error/10 flex items-center justify-center border border-error/20">
        <AlertTriangle size={28} className="text-error" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-black uppercase tracking-tight">Algo salió mal</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          {error.message || "Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado."}
        </p>
      </div>
      <Button onClick={reset} className="rounded-sm">Reintentar</Button>
    </div>
  );
}
