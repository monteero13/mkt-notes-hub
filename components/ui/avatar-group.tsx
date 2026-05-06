import * as React from "react"
import { cn } from "@/lib/utils/cn"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  members: {
    id: string;
    profile: {
      full_name: string | null;
      avatar_url: string | null;
    } | null;
  }[];
  limit?: number;
}

export function AvatarGroup({ members, limit = 4, className, ...props }: AvatarGroupProps) {
  const displayMembers = members.slice(0, limit);
  const remainingCount = members.length - limit;

  return (
    <div className={cn("flex -space-x-3 items-center", className)} {...props}>
      {displayMembers.map((member) => {
        const initials = member.profile?.full_name
          ? member.profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
          : "U";

        return (
          <Avatar key={member.id} className="h-8 w-8 rounded-full border-2 border-background ring-0 shadow-sm transition-transform hover:-translate-y-0.5">
            <AvatarImage src={member.profile?.avatar_url ?? undefined} alt={member.profile?.full_name ?? "Member"} />
            <AvatarFallback className="bg-muted text-[10px] font-black uppercase">{initials}</AvatarFallback>
          </Avatar>
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
