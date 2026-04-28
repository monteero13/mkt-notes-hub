'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import Link from "next/link";
import {
  BarChart3,
  FileText,
  Target,
  CheckSquare,
  Plus,
  TrendingUp,
  Clock
} from "lucide-react";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useContent, useObjectives, useTeam } from "@/hooks/use-features-data";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";

export default function DashboardPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { campaigns, tasks } = useDashboardData();
  const { data: content = [] } = useContent();
  const { data: objectives = [] } = useObjectives();
  const { data: team } = useTeam();
  const supabase = createClient();
  const queryClient = useQueryClient();

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase.from('tasks').update({ completed }).eq('id', taskId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (e: any) {
      toast.error(t('common.error'));
    }
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'Marketing Lead';

  const stats = [
    { label: t('dashboard.active_campaigns'), value: campaigns.length.toString() || "0", trend: { value: t('dashboard.current_month'), positive: true }, icon: BarChart3 },
    { label: t('dashboard.planned_posts'), value: content.length.toString() || "0", trend: { value: t('dashboard.this_week'), positive: true }, icon: FileText },
    { label: t('dashboard.goals_achieved'), value: objectives.length > 0 ? `${objectives.filter(o => o.progress === 100).length}/${objectives.length}` : "0/0", trend: { value: "Q2 2026", positive: true }, icon: Target },
    { label: t('dashboard.pending_tasks'), value: tasks.filter(t => !t.completed).length.toString() || "0", trend: { value: t('dashboard.urgent_count', { count: tasks.filter(tk => !tk.completed && tk.priority === 'high').length }), positive: false }, icon: CheckSquare },
  ];

  const displayTasks = tasks.length > 0 ? tasks.filter(t => !t.completed).slice(0, 4) : [
    { id: '1', title: t('dashboard.mock_task_1'), priority: "Alta", status: "Pendiente", category_color: "red", due_date: t('dashboard.mock_date_tomorrow') },
    { id: '2', title: t('dashboard.mock_task_2'), priority: "Media", status: "Pendiente", category_color: "purple", due_date: t('dashboard.mock_date_today') },
  ];

  const displayCampaigns = campaigns.length > 0 ? campaigns.slice(0, 3) : [
    { id: '1', name: "Lanzamiento Verano 2026", channel: "Email, Social Media", progress: 35 },
    { id: '2', name: "Estrategia de Fidelización", channel: "TikTok, Ads", progress: 60 },
  ];

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
            <PageHeader 
                title={`${t('dashboard.welcome')}, ${firstName}`} 
                description={`${t('dashboard.desc')} ${team?.name ? `(${team.name})` : ''}`} 
            />
            <CreateTaskDialog>
                <Button className="gap-2 font-bold tour-item-new-action">
                    <Plus className="h-4 w-4" /> {t('common.new')} {t('planificador.categories.strategy')}
                </Button>
            </CreateTaskDialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 tour-item-stats">
          {stats.map((stat, i) => (
            <StatCard
                key={i}
                title={stat.label}
                value={stat.value}
                icon={stat.icon}
                trend={stat.trend}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Active Campaigns */}
          <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm tour-item-campaigns-list">
             <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold">{t('dashboard.active_campaigns')}</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
             </CardHeader>
             <CardContent className="space-y-6">
                {displayCampaigns.map((camp: any) => (
                  <div key={camp.id} className="space-y-3 group">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-bold text-sm group-hover:text-primary transition-colors">{camp.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {camp.channel}
                        </p>
                      </div>
                      <div className="flex -space-x-2">
                         {team?.members?.slice(0, 2).map((m: any) => (
                            <Avatar key={m.user_id} className="h-6 w-6 border-2 border-background">
                                <AvatarImage src={m.profiles?.avatar_url} />
                                <AvatarFallback className="bg-muted text-[8px] font-bold">{m.profiles?.full_name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                         ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{t('campanas.table.progress')}</span>
                            <span className="font-medium">{camp.progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                           <div 
                             className="h-full bg-primary transition-all duration-1000" 
                             style={{ width: `${camp.progress}%` }} 
                           />
                        </div>
                    </div>
                  </div>
                ))}
             </CardContent>
          </Card>

          {/* RIGHT: Priority Tasks */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm tour-item-priority-tasks">
             <CardHeader>
                 <CardTitle className="text-lg font-bold">{t('dashboard.priority_tasks')}</CardTitle>
             </CardHeader>
             <CardContent className="space-y-6">
                {displayTasks.map((task: any) => (
                   <div key={task.id} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-muted/50 transition-colors group cursor-default">
                      <div className={cn("mt-1 h-2 w-2 rounded-full", task.priority === 'Alta' ? 'bg-red-500 animate-pulse' : 'bg-primary')} />
                      <div className="flex-1">
                          <p className="text-sm font-bold group-hover:text-primary transition-colors">{task.title}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {task.due_date || t('common.no_date', 'Sin fecha')}
                          </div>
                      </div>
                      {team?.members?.slice(0, 1).map((m: any) => (
                        <Avatar key={m.user_id} className="h-6 w-6 border-2 border-background">
                            <AvatarImage src={m.profiles?.avatar_url} />
                            <AvatarFallback className="bg-muted text-[8px] font-bold">{m.profiles?.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                      ))}
                   </div>
                ))}
                <Link href="/planificador" className="block w-full mt-4">
                  <Button variant="outline" className="w-full">{t('dashboard.view_full_agenda')}</Button>
                </Link>
             </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
