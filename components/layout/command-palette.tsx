"use client";

import * as React from "react";
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  LayoutDashboard,
  Users,
  Megaphone,
  CalendarRange,
  PlusCircle,
  ClipboardList,
  UserPlus,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useTranslations } from "next-intl";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const t = useTranslations("layout.command_palette");

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between">
        <span className="technical-label text-[9px] opacity-40 uppercase tracking-[0.2em]">Command Terminal v2.4.0</span>
        <div className="flex gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-success/20" />
          <div className="h-1.5 w-1.5 rounded-full bg-brand/20" />
        </div>
      </div>
      <CommandInput placeholder={t("placeholder")} className="h-14 border-none focus:ring-0 text-foreground" />
      <CommandList className="max-h-[480px] scrollbar-hide pb-2 px-1">
        <CommandEmpty className="py-16 text-center">
          <div className="flex flex-col items-center gap-2">
            <Search className="h-8 w-8 opacity-10" />
            <p className="technical-label text-[10px] opacity-40 uppercase tracking-widest">{t("empty")}</p>
          </div>
        </CommandEmpty>

        <CommandGroup heading={t("groups.navigation")} className="px-2">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))} className="h-11 rounded-sm mb-0.5 focus:bg-brand/5 focus:text-brand transition-colors">
            <LayoutDashboard className="mr-3 h-4 w-4 opacity-40 group-focus:opacity-100" />
            <span className="text-[11px] font-black uppercase tracking-widest">{t("items.dashboard")}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/clients"))} className="h-11 rounded-sm mb-0.5 focus:bg-brand/5 focus:text-brand transition-colors">
            <Users className="mr-3 h-4 w-4 opacity-40 group-focus:opacity-100" />
            <span className="text-[11px] font-black uppercase tracking-widest">{t("items.clients")}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/campaigns"))} className="h-11 rounded-sm mb-0.5 focus:bg-brand/5 focus:text-brand transition-colors">
            <Megaphone className="mr-3 h-4 w-4 opacity-40 group-focus:opacity-100" />
            <span className="text-[11px] font-black uppercase tracking-widest">{t("items.campaigns")}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/planner"))} className="h-11 rounded-sm mb-0.5 focus:bg-brand/5 focus:text-brand transition-colors">
            <CalendarRange className="mr-3 h-4 w-4 opacity-40 group-focus:opacity-100" />
            <span className="text-[11px] font-black uppercase tracking-widest">{t("items.calendar")}</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="my-3 opacity-30" />

        <CommandGroup heading={t("groups.actions")} className="px-2">
          <CommandItem onSelect={() => runCommand(() => { })} className="h-11 rounded-sm mb-0.5 focus:bg-brand/5 focus:text-brand transition-colors group">
            <PlusCircle className="mr-3 h-4 w-4 text-brand opacity-60 group-focus:opacity-100" />
            <span className="text-[11px] font-black uppercase tracking-widest text-brand/80 group-focus:text-brand">{t("items.new_campaign")}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => { })} className="h-11 rounded-sm mb-0.5 focus:bg-brand/5 focus:text-brand transition-colors group">
            <ClipboardList className="mr-3 h-4 w-4 text-brand opacity-60 group-focus:opacity-100" />
            <span className="text-[11px] font-black uppercase tracking-widest text-brand/80 group-focus:text-brand">{t("items.new_task")}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => { })} className="h-11 rounded-sm mb-0.5 focus:bg-brand/5 focus:text-brand transition-colors group">
            <UserPlus className="mr-3 h-4 w-4 text-brand opacity-60 group-focus:opacity-100" />
            <span className="text-[11px] font-black uppercase tracking-widest text-brand/80 group-focus:text-brand">{t("items.add_client")}</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="my-3 opacity-30" />

        <CommandGroup heading={t("groups.suggestions")} className="px-2">
          <CommandItem onSelect={() => runCommand(() => { })} className="h-11 rounded-sm mb-0.5 focus:bg-brand/5 focus:text-brand transition-colors">
            <Smile className="mr-3 h-4 w-4 opacity-40" />
            <span className="text-[11px] font-black uppercase tracking-widest">{t("items.emoji")}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => { })} className="h-11 rounded-sm mb-0.5 focus:bg-brand/5 focus:text-brand transition-colors">
            <Calculator className="mr-3 h-4 w-4 opacity-40" />
            <span className="text-[11px] font-black uppercase tracking-widest">{t("items.calculator")}</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="my-3 opacity-30" />

        <CommandGroup heading={t("groups.settings")} className="px-2">
          <CommandItem onSelect={() => runCommand(() => router.push("/settings"))} className="h-11 rounded-sm mb-0.5 focus:bg-brand/5 focus:text-brand transition-colors group">
            <User className="mr-3 h-4 w-4 opacity-40 group-focus:opacity-100" />
            <span className="text-[11px] font-black uppercase tracking-widest">{t("items.profile")}</span>
            <CommandShortcut className="text-[9px] font-black opacity-30 group-focus:opacity-60">⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/billing"))} className="h-11 rounded-sm mb-0.5 focus:bg-brand/5 focus:text-brand transition-colors group">
            <CreditCard className="mr-3 h-4 w-4 opacity-40 group-focus:opacity-100" />
            <span className="text-[11px] font-black uppercase tracking-widest">{t("items.billing")}</span>
            <CommandShortcut className="text-[9px] font-black opacity-30 group-focus:opacity-60">⌘B</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/settings"))} className="h-11 rounded-sm mb-0.5 focus:bg-brand/5 focus:text-brand transition-colors group">
            <Settings className="mr-3 h-4 w-4 opacity-40 group-focus:opacity-100" />
            <span className="text-[11px] font-black uppercase tracking-widest">{t("items.settings")}</span>
            <CommandShortcut className="text-[9px] font-black opacity-30 group-focus:opacity-60">⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
