"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Users, Zap, ListTodo, FileText, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

import { useTranslations } from "next-intl";

export function QuickActions() {
  const t = useTranslations("dashboard.quick_actions");
  const router = useRouter();

  const actions = [
    { label: t("campaign"), icon: Zap, href: "/campaigns?new=true", color: "text-brand" },
    { label: t("client"), icon: Users, href: "/clients?new=true", color: "text-success" },
    { label: t("task"), icon: ListTodo, href: "/planner?new=true", color: "text-warning" },
    { label: t("content"), icon: FileText, href: "/content?new=true", color: "text-brand" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="h-8 rounded-sm bg-brand px-4 text-[10px] font-bold uppercase tracking-widest text-white hover:opacity-90 gap-2">
          <Plus size={14} />
          {t("trigger")}
          <ChevronDown size={12} className="opacity-40" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-sm border-border bg-card p-1 shadow-2xl">
        <div className="px-2 py-1.5 technical-label text-[8px] opacity-40 uppercase tracking-widest">{t("hub_title")}</div>
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <DropdownMenuItem 
              key={a.label} 
              onClick={() => router.push(a.href)}
              className="p-2 rounded-sm technical-label text-[9px] uppercase tracking-widest cursor-pointer focus:bg-accent/5"
            >
              <Icon size={14} className={`mr-3 ${a.color}`} />
              {a.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

