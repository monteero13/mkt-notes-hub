"use client";

import { motion } from "framer-motion";
import { Calendar, CheckSquare, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { useTranslations } from "next-intl";

interface Props {
  activeCampaigns: number;
  pendingTasks: number;
  scheduledThisWeek: number;
  totalClients: number;
}

export function DashboardStats({ activeCampaigns, pendingTasks, scheduledThisWeek, totalClients }: Props) {
  const t = useTranslations("dashboard.stats");

  const stats = [
    {
      label: t("active_campaigns"),
      value: activeCampaigns,
      icon: Zap,
      change: t("change_positive", { value: 2 }),
      color: "brand",
    },
    {
      label: t("pending_tasks"),
      value: pendingTasks,
      icon: CheckSquare,
      change: t("change_negative"),
      color: "warning",
    },
    {
      label: t("posts_week"),
      value: scheduledThisWeek,
      icon: Calendar,
      change: t("change_neutral"),
      color: "brand",
    },
    {
      label: t("active_clients"),
      value: totalClients,
      icon: Users,
      change: t("change_positive", { value: 1 }),
      color: "success",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        
        // Custom color classes based on semantic type
        const colorStyles = 
          stat.color === "brand" 
            ? { iconContainer: "bg-brand/10 border-brand/20 text-brand", badge: "bg-brand/10 text-brand border-brand/20" }
            : stat.color === "warning"
            ? { iconContainer: "bg-warning/10 border-warning/20 text-warning", badge: "bg-warning/10 text-warning border-warning/20" }
            : { iconContainer: "bg-success/10 border-success/20 text-success", badge: "bg-success/10 text-success border-success/20" };

        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, ease: "easeOut" }}
          >
            <Card className="rounded-xl border border-border/60 bg-card p-5 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-4">
                {/* Icon Badge */}
                <div className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center border shrink-0 transition-transform duration-300 group-hover:scale-110",
                  colorStyles.iconContainer
                )}>
                  <Icon size={18} className="stroke-[2px]" />
                </div>
                
                {/* Text Block */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <motion.span
                      className="text-2xl font-bold tracking-tight text-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 + 0.1 }}
                    >
                      {stat.value}
                    </motion.span>
                    <span className={cn(
                      "text-[9px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase",
                      colorStyles.badge
                    )}>
                      {stat.change}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-muted-foreground/80 mt-1 truncate uppercase tracking-wider">{stat.label}</div>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}


