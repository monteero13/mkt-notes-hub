"use client";

import { motion } from "framer-motion";
import { Calendar, CheckSquare, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
      positive: true,
    },
    {
      label: t("pending_tasks"),
      value: pendingTasks,
      icon: CheckSquare,
      change: t("change_negative"),
      positive: false,
    },
    {
      label: t("posts_week"),
      value: scheduledThisWeek,
      icon: Calendar,
      change: t("change_neutral"),
      positive: true,
    },
    {
      label: t("active_clients"),
      value: totalClients,
      icon: Users,
      change: t("change_positive", { value: 1 }),
      positive: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="rounded-xl border-border shadow-sm">
              <CardHeader className="flex-row items-center justify-between pb-2 pt-4 px-5 space-y-0">
                <Icon size={14} className="text-muted-foreground/40" />
                <span className={cn(
                  "text-[11px] font-bold px-2 py-0.5 rounded-full border",
                  stat.positive
                    ? "bg-brand/10 text-brand border-brand/20"
                    : "bg-warning/5 text-warning border-warning/20"
                )}>
                  {stat.change}
                </span>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <motion.div
                  className="text-4xl font-light tracking-tight"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.08 + 0.2 }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-xs font-semibold text-muted-foreground/90 mt-1.5">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

