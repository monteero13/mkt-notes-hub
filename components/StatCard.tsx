import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
}

export function StatCard({ title, value, subtitle, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="group relative border border-border bg-card p-5 transition-all duration-150 hover:border-brand shadow-sm rounded-sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="technical-label">{title}</div>
          <div className="text-muted-foreground/30 group-hover:text-brand transition-colors">
            <Icon size={14} strokeWidth={3} />
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-baseline gap-3">
            <span className="text-2xl contundente-number text-foreground">
              {value}
            </span>
            {trend && (
              <span className={cn(
                "text-[10px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-widest",
                trend.positive ? "bg-success/10 text-success" : "bg-error/10 text-error"
              )}>
                {trend.positive ? "+" : "-"}{trend.value}
              </span>
            )}
          </div>
          {subtitle && (
            <div className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-wider">
              {subtitle}
            </div>
          )}
        </div>
      </div>
      
      {/* Precision Accent */}
      <div className="absolute top-0 left-0 w-1 h-0 bg-brand transition-all duration-300 group-hover:h-full" />
    </div>
  );
}
