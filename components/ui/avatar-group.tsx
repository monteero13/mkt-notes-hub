import * as React from "react"
import { cn } from "@/lib/utils/cn"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useWorkspace } from "@/hooks/use-workspace"

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  members: {
    id: string;
    user_id: string;
    profile: {
      full_name: string | null;
      avatar_url: string | null;
    } | null;
  }[];
  limit?: number;
}

export function AvatarGroup({ members, limit = 4, className, ...props }: AvatarGroupProps) {
  const { onlineUsers } = useWorkspace();

  // Ordenar miembros: los que están en línea se muestran primero (a la izquierda)
  const sortedMembers = React.useMemo(() => {
    return [...members].sort((a, b) => {
      const aOnline = !!onlineUsers?.[a.user_id];
      const bOnline = !!onlineUsers?.[b.user_id];
      if (aOnline && !bOnline) return -1;
      if (!aOnline && bOnline) return 1;
      return 0;
    });
  }, [members, onlineUsers]);

  const displayMembers = sortedMembers.slice(0, limit);
  const remainingCount = sortedMembers.length - limit;

  return (
    <div className={cn("flex -space-x-3 items-center", className)} {...props}>
      {displayMembers.map((member) => {
        const isOnline = !!onlineUsers?.[member.user_id];
        const initials = member.profile?.full_name
          ? member.profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
          : "U";

        return (
          <div
            key={member.id}
            className="relative group transition-all duration-300"
            title={`${member.profile?.full_name ?? ""} ${isOnline ? "(En línea)" : "(Desconectado)"}`}
          >
            <Avatar className={cn(
              "h-8 w-8 rounded-full border-2 border-background ring-0 shadow-sm transition-all duration-300 hover:-translate-y-0.5",
              !isOnline && "opacity-45 grayscale-[40%] brightness-75 hover:opacity-80 hover:grayscale-0 hover:brightness-100"
            )}>
              <AvatarImage src={member.profile?.avatar_url ?? undefined} alt={member.profile?.full_name ?? "Member"} />
              <AvatarFallback className="bg-muted text-[10px] font-black uppercase">{initials}</AvatarFallback>
            </Avatar>
            {isOnline && (
              <span className="absolute bottom-0 right-0 flex h-2.5 w-2.5 z-10">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-background" />
              </span>
            )}
          </div>
        );
      })}
      {remainingCount > 0 && (
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-accent technical-label text-[9px] font-black text-foreground shadow-sm">
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
