"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ collapsed }: { collapsed: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(next: "es" | "en") {
    if (next === locale) return;
    // Replace /es/... or /en/... with the new locale prefix
    const newPath = pathname.replace(/^\/(es|en)/, `/${next}`);
    router.push(newPath);
  }

  return (
    <div className={cn(
      "flex items-center gap-1 rounded-sm border border-white/10 bg-white/5 p-1",
      collapsed ? "mx-auto w-fit" : "w-full"
    )}>
      {(["es", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          className={cn(
            "flex-1 rounded-sm py-1 technical-label text-[9px] transition-all",
            locale === l
              ? "bg-brand text-white shadow-sm"
              : "text-white/40 hover:text-white"
          )}
        >
          {collapsed ? l.toUpperCase() : l === "es" ? "🇪🇸 ES" : "🇬🇧 EN"}
        </button>
      ))}
    </div>
  );
}
