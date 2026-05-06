"use client";

import { useWorkspace } from "@/hooks/use-workspace";
import { NotificationsPopover } from "@/components/features/notifications/notifications-popover";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { Search, LogOut, User, CreditCard, ChevronDown, Activity, ShieldCheck, Bell, Menu } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export function AppTopbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { profile, activeWorkspace, members } = useWorkspace();
  const router = useRouter();
  const t = useTranslations("layout.topbar");
  const tc = useTranslations("common");

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : profile?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-4 sm:px-8 z-40 gap-4">
      {/* Mobile Menu Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden h-9 w-9 shrink-0 rounded-sm"
        onClick={onMenuClick}
      >
        <Menu size={18} />
      </Button>

      {/* Global Command Search */}
      <button
        onClick={() => {
          const event = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true });
          document.dispatchEvent(event);
        }}
        className="group flex h-9 items-center gap-4 rounded-sm border border-border bg-muted/30 px-4 text-sm text-muted-foreground transition-all hover:border-brand/50 hover:bg-muted/50 sm:w-80 md:w-96 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]"
      >
        <Search size={13} className="text-muted-foreground/30 group-hover:text-brand transition-colors" />
        <span className="hidden sm:inline technical-label text-[10px] opacity-40 group-hover:opacity-100 transition-opacity uppercase tracking-wider">{t("search_placeholder")}</span>
        <div className="ml-auto hidden items-center gap-1.5 sm:flex">
          <kbd className="flex h-5 items-center justify-center rounded-sm border border-border bg-background px-1.5 technical-label text-[8px] font-black opacity-30 group-hover:opacity-60 transition-opacity">
            ⌘ K
          </kbd>
        </div>
      </button>

      <div className="flex items-center gap-8">
        <div className="flex items-center gap-6">
          {members && members.length > 0 && (
            <div className="hidden lg:flex items-center gap-4 border-r border-border/50 pr-8">
              <div className="flex flex-col items-end gap-1 mr-2">
                <span className="technical-label text-[7px] opacity-40 uppercase tracking-[0.2em] font-black">{t("active_members") || "ACTIVE DEPLOYMENT"}</span>
                <div className="h-[1px] w-8 bg-gradient-to-r from-brand/20 to-transparent" />
              </div>
              <AvatarGroup members={members} limit={5} />
            </div>
          )}
           {activeWorkspace?.id && profile?.id ? (
             <NotificationsPopover workspaceId={activeWorkspace.id} userId={profile.id} />
           ) : (
             <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
               <Bell size={18} />
             </Button>
           )}
        </div>

        <div className="h-6 w-[1px] bg-border opacity-20" />

        {/* Personnel Hub */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-sm py-1 transition-all group">
              <Avatar className="h-8 w-8 rounded-sm border border-border transition-all shadow-sm">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback className="bg-brand text-[10px] font-black text-white rounded-sm">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left hidden sm:flex">
                <span className="text-[11px] font-black tracking-tight text-foreground leading-none mb-1 uppercase">{profile?.full_name ?? tc("operator")}</span>
                <div className="flex items-center gap-1.5">
                   <ShieldCheck size={10} className="text-brand opacity-60" />
                   <span className="technical-label text-[8px] opacity-50">{t("session_encrypted")}</span>
                </div>
              </div>
              <ChevronDown size={10} className="text-muted-foreground/40 group-hover:text-brand transition-colors ml-1" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2 rounded-sm border-border bg-card shadow-2xl p-1">
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex flex-col space-y-1">
                <p className="technical-label text-[10px] text-foreground">{profile?.full_name || tc("active_agent")}</p>
                <p className="technical-label text-[8px] opacity-60 truncate">{profile?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-1 space-y-0.5">
              <DropdownMenuItem asChild className="rounded-sm cursor-pointer h-9 px-3 focus:bg-brand/10 focus:text-brand">
                <Link href="/settings" className="flex items-center technical-label text-[9px]"><User size={12} className="mr-3 opacity-40" />{t("user_menu.profile")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-sm cursor-pointer h-9 px-3 focus:bg-brand/10 focus:text-brand">
                <Link href="/billing" className="flex items-center technical-label text-[9px]"><CreditCard size={12} className="mr-3 opacity-40" />{t("user_menu.billing")}</Link>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <div className="p-1">
              <DropdownMenuItem className="text-error focus:bg-error/10 focus:text-error rounded-sm cursor-pointer h-9 px-3 technical-label text-[9px]" onClick={handleSignOut}>
                <LogOut size={12} className="mr-3" />{t("user_menu.logout")}
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
