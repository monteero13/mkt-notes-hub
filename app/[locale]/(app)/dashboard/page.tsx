'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export default function DashboardPage() {
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    router.replace(`/${locale}/campaigns`);
  }, [router, locale]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-10 w-10 items-center justify-center">
          <div className="absolute h-full w-full rounded-full border-4 border-brand/20 border-t-brand animate-spin" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 animate-pulse">
          Accediendo a Mis Campañas...
        </p>
      </div>
    </div>
  );
}
