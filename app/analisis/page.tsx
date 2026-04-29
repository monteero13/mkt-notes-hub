'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import {
    Users,
    Target,
    Zap,
    TrendingUp,
    Calendar,
    MoreHorizontal,
    Clock,
    Crown
} from "lucide-react";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useTeam } from "@/hooks/use-team";

export default function AnalisisAvanzadoPage() {
    const { t } = useTranslation();
    const { profile, user, isLoading } = useAuth();
    const { data: team } = useTeam();
    const supabase = createClient();

    const { data: analytics, isLoading: analyticsLoading } = useQuery({
        queryKey: ['analytics', user?.id, team?.id],
        enabled: !!user && !!profile?.is_pro,
        queryFn: async () => {
            const [campaignsRes, tasksRes, objectivesRes] = await Promise.all([
                supabase.from('campaigns').select('*'),
                supabase.from('tasks').select('*'),
                supabase.from('objectives').select('*')
            ]);

            return {
                campaigns: campaignsRes.data || [],
                tasks: tasksRes.data || [],
                objectives: objectivesRes.data || []
            };
        }
    });

    if (isLoading || analyticsLoading) {
        return (
            <DashboardLayout>
                <div className="p-8 min-h-[calc(100vh-12rem)] flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!profile?.is_pro) {
        return (
            <DashboardLayout>
                <div className="p-8 min-h-[calc(100vh-12rem)] flex items-center justify-center">
                    <div className="py-20 px-8 text-center border-2 border-dashed border-border rounded-xl bg-card/50 flex flex-col items-center max-w-lg">
                        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                            <Crown className="h-8 w-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Analítica Avanzada PRO</h2>
                        <p className="text-muted-foreground mb-8 text-sm">
                            Obtén una visión profunda del rendimiento de tus campañas, alcance de audiencia y tasas de conversión con las herramientas de análisis de Mkt.Notes PRO.
                        </p>
                        <Button className="bg-primary text-primary-foreground font-bold hover:scale-105 transition-transform" onClick={() => window.location.href = '/pricing'}>
                            Actualizar a PRO
                        </Button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // Calcular métricas reales
    const totalCampaigns = analytics?.campaigns.length || 0;
    const avgConversion = totalCampaigns > 0 
        ? Math.round(analytics!.campaigns.reduce((acc, c) => acc + (c.progress || 0), 0) / totalCampaigns)
        : 0;
    
    const totalObjectives = analytics?.objectives.length || 0;
    const completedObjectives = analytics?.objectives.filter(o => (o.current_value || 0) >= (o.target_value || 1)).length || 0;
    const objectivesProgress = totalObjectives > 0 ? Math.round((completedObjectives / totalObjectives) * 100) : 0;

    const totalReach = analytics?.objectives.reduce((acc, o) => acc + (Number(o.current_value) || 0), 0) || 0;
    const formattedReach = totalReach >= 1000 ? `${(totalReach / 1000).toFixed(1)}k` : totalReach.toString();

    // Tareas reales para la lista
    const recentTasks = analytics?.tasks
        .filter(t => t.status !== 'completed')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 4) || [];

    // Generar datos para el gráfico de los últimos 7 días
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        d.setHours(0, 0, 0, 0);
        return d;
    });

    const chartData = last7Days.map(date => {
        const dayStr = date.toLocaleDateString(t('common.locale', 'es-ES'), { weekday: 'short' });
        
        const dayCampaigns = analytics?.campaigns.filter(c => {
            const cd = new Date(c.created_at);
            return cd.getDate() === date.getDate() && cd.getMonth() === date.getMonth();
        }).length || 0;

        const dayTasksCompleted = analytics?.tasks.filter(t => {
            const td = new Date(t.created_at); // Idealmente tendríamos completed_at
            return td.getDate() === date.getDate() && td.getMonth() === date.getMonth() && t.status === 'completed';
        }).length || 0;

        return {
            name: dayStr.charAt(0).toUpperCase() + dayStr.slice(1),
            campaigns: dayCampaigns,
            activity: dayTasksCompleted * 10 // Multiplicador visual para el gráfico simulando alcance/actividad
        };
    });

    return (
        <DashboardLayout>
            <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                    <PageHeader
                        title="Analítica Avanzada"
                        description="Visión general del rendimiento de tus campañas y equipo."
                    />
                    <Badge variant="outline" className="px-4 py-2 bg-primary/10 text-primary border-primary/20 font-bold">
                        PRO
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title={t('demo.stats.reach')}
                        value={formattedReach}
                        icon={Users}
                        trend={{ value: "+12%", positive: true }}
                    />
                    <StatCard
                        title={t('demo.stats.campaigns')}
                        value={totalCampaigns.toString()}
                        icon={Zap}
                        trend={{ value: "Activas", positive: true }}
                    />
                    <StatCard
                        title={t('demo.stats.conversion')}
                        value={`${avgConversion}%`}
                        icon={TrendingUp}
                        trend={{ value: "Progreso Medio", positive: avgConversion >= 50 }}
                    />
                    <StatCard
                        title={t('demo.stats.objectives')}
                        value={`${objectivesProgress}%`}
                        icon={Target}
                        trend={{ value: `${completedObjectives} de ${totalObjectives}`, positive: objectivesProgress >= 50 }}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold">Actividad de la Semana</CardTitle>
                                <p className="text-sm text-muted-foreground">Campañas creadas y volumen de actividad reciente.</p>
                            </div>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }}
                                        />
                                        <Area type="monotone" dataKey="activity" name="Actividad (Puntos)" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorActivity)" strokeWidth={3} />
                                        <Area type="monotone" dataKey="campaigns" name="Campañas" stroke="hsl(var(--blue-500))" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">{t('demo.tasks_title')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {recentTasks.length > 0 ? recentTasks.map((task, i) => (
                                <div key={task.id} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-muted/50 transition-colors group cursor-default">
                                    <div className={`mt-1 h-2 w-2 rounded-full ${task.priority === 'high' ? 'bg-red-500 animate-pulse' : 'bg-primary'}`} />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold group-hover:text-primary transition-colors line-clamp-1">{task.title}</p>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            {new Date(task.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    No hay tareas pendientes.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="border-border/50 bg-card/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                                <h4 className="font-bold">Progreso Global de Campañas</h4>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">Media de progreso de todas tus campañas activas.</p>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 transition-all" style={{ width: `${avgConversion}%` }} />
                            </div>
                            <div className="mt-2 text-right text-xs font-bold text-muted-foreground">{avgConversion}%</div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 bg-card/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                                    <Users className="h-5 w-5" />
                                </div>
                                <h4 className="font-bold">Miembros del Equipo</h4>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">Colaboradores activos en tu espacio de trabajo.</p>
                            <div className="flex -space-x-2">
                                {team?.members && team.members.length > 0 ? team.members.map((m: any, i: number) => (
                                    <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-primary/10 overflow-hidden flex items-center justify-center text-xs font-bold text-primary" title={m.profiles?.full_name || 'Miembro'}>
                                        {m.profiles?.avatar_url ? (
                                            <img src={m.profiles.avatar_url} alt="User" />
                                        ) : (
                                            (m.profiles?.full_name || 'M').charAt(0).toUpperCase()
                                        )}
                                    </div>
                                )) : (
                                    <div className="text-xs text-muted-foreground">Solo tú estás en este equipo</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
