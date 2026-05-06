"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowRight, Instagram, Youtube, Linkedin, Mail, FileText, Twitter } from "lucide-react";
import type { ContentItem } from "@/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils/cn";

import { useTranslations } from "next-intl";

const CHANNEL_CONFIG: Record<string, { icon: any; color: string }> = {
  instagram: { icon: Instagram, color: "text-pink-500" },
  youtube:   { icon: Youtube,   color: "text-red-500" },
  linkedin:  { icon: Linkedin,  color: "text-blue-600" },
  email:     { icon: Mail,      color: "text-amber-500" },
  blog:      { icon: FileText,  color: "text-emerald-500" },
  twitter:   { icon: Twitter,   color: "text-sky-500" },
  tiktok:    { icon: FileText,  color: "text-foreground" },
  facebook:  { icon: FileText,  color: "text-blue-500" },
  other:     { icon: FileText,  color: "text-muted-foreground/50" },
};

interface Props {
  items: (ContentItem & { client?: { company_name: string } | null })[];
}

export function UpcomingContent({ items }: Props) {
  const t = useTranslations("dashboard.content");

  return (
    <Card className="rounded-sm border-border shadow-sm overflow-hidden">
      <CardHeader className="flex-row items-center justify-between h-14 border-b border-border px-6 py-0 space-y-0">
        <div className="technical-label text-foreground text-[11px]">{t("title")}</div>
        <Button variant="ghost" size="sm" asChild className="h-8 rounded-sm technical-label text-[9px] hover:bg-accent/10">
          <Link href="/content" className="flex items-center gap-2">
            {t("calendar_view")} <ArrowRight size={10} />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="p-2">
        {items.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center gap-3">
            <div className="technical-label text-[10px] opacity-40 uppercase tracking-widest">
              {t("no_assets")}
            </div>
            <Link href="/content?new=true" className="technical-label text-[9px] text-brand hover:underline">
              {t("init_node")} →
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {items.map((item) => {
              const chKey = item.channel in CHANNEL_CONFIG ? item.channel : "other";
              const ch = CHANNEL_CONFIG[chKey] ?? CHANNEL_CONFIG["other"]!;
              const Icon = ch.icon;

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-sm border border-transparent p-3 transition-all hover:bg-accent/5 hover:border-border group"
                >
                  <Icon size={14} className={cn("shrink-0", ch.color)} />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-black uppercase tracking-tight text-foreground group-hover:text-brand transition-colors">
                      {item.title}
                    </p>
                    <p className="mt-1 technical-label text-[8px] uppercase tracking-widest opacity-40">
                      {item.client?.company_name && (
                        <span className="text-brand">{item.client.company_name} / </span>
                      )}
                      {item.scheduled_at && format(new Date(item.scheduled_at), "MMM d, HH:mm")}
                    </p>
                  </div>

                  <Badge variant="outline" className="shrink-0 technical-label text-[7px] px-1.5 py-0 rounded-sm border opacity-60">
                    {t(`channels.${chKey}`)}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <div className="h-10 border-t border-border flex items-center justify-center bg-accent/5">
        <span className="technical-label text-[8px] opacity-30 uppercase tracking-widest">{t("outlook")}</span>
      </div>
    </Card>
  );
}

