"use client";

import { useWorkspace } from "./workspace-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building2, ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

interface WorkspaceSwitcherProps {
  collapsed?: boolean;
}

export function WorkspaceSwitcher({ collapsed }: WorkspaceSwitcherProps) {
  const { activeWorkspace, workspaces, setActiveWorkspace } = useWorkspace();
  const router = useRouter();
  const queryClient = useQueryClient();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn(
          "flex items-center gap-3 rounded-md p-1.5 text-left transition-all hover:bg-accent group",
          collapsed ? "w-full justify-center px-0" : "w-full"
        )}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand text-white font-black text-[12px] transition-transform group-hover:scale-105">
            {activeWorkspace?.name ? activeWorkspace.name.slice(0, 2).toUpperCase() : <Building2 size={14} />}
          </div>
          {!collapsed && (
            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="truncate text-[13px] font-bold tracking-tight text-foreground">{activeWorkspace?.name ?? "Select Workspace"}</span>
              <span className="truncate text-[10px] text-muted-foreground uppercase tracking-[0.1em] font-medium">
                {activeWorkspace?.role ?? "Member"}
              </span>
            </div>
          )}
          {!collapsed && <ChevronDown size={14} className="text-muted-foreground transition-transform group-hover:translate-y-0.5" />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72 mt-2 rounded-2xl border-border/10 bg-card/50 backdrop-blur-3xl shadow-2xl p-2">
        <DropdownMenuLabel className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-[0.2em] px-3 py-3">
          Your Workspaces
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/5" />
        <div className="space-y-1 py-1">
          {workspaces.map((ws) => (
            <DropdownMenuItem
              key={ws.id}
              onClick={() => {
                setActiveWorkspace(ws.id);
                queryClient.invalidateQueries({ queryKey: ['auth-user'] });
                queryClient.invalidateQueries({ queryKey: ['workspace-members', ws.id] });
                queryClient.invalidateQueries({ queryKey: ['workspace-invites', ws.id] });
                router.refresh();
              }}
              className={cn(
                "flex items-center gap-3 p-3 cursor-pointer rounded-xl transition-all focus:bg-primary/5",
                activeWorkspace?.id === ws.id && "bg-primary/5"
              )}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 text-[10px] font-black text-primary">
                {ws.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold tracking-tight">{ws.name}</span>
                <span className="text-[10px] text-muted-foreground/50 font-medium uppercase tracking-wider">{ws.role}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator className="bg-border/5" />
        <div className="p-1">
          <DropdownMenuItem className="p-3 cursor-pointer text-primary focus:bg-primary/5 rounded-xl flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Plus size={16} strokeWidth={3} />
            </div>
            <span className="text-[13px] font-bold">Create Workspace</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
