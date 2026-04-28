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
    Clock
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

export default function DemoDashboardPage() {
    const { t } = useTranslation();

    const data = [
        { name: t('common.days_short.mon', 'Lun'), campaigns: 4, reach: 2400 },
        { name: t('common.days_short.tue', 'Mar'), campaigns: 3, reach: 1398 },
        { name: t('common.days_short.wed', 'Mie'), campaigns: 2, reach: 9800 },
        { name: t('common.days_short.thu', 'Jue'), campaigns: 5, reach: 3908 },
        { name: t('common.days_short.fri', 'Vie'), campaigns: 8, reach: 4800 },
        { name: t('common.days_short.sat', 'Sab'), campaigns: 6, reach: 3800 },
        { name: t('common.days_short.sun', 'Dom'), campaigns: 4, reach: 4300 },
    ];

    return (
        <DashboardLayout>
            <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                    <PageHeader
                        title={t('demo.title')}
                        description={t('demo.desc')}
                    />
                    <Badge variant="outline" className="px-4 py-2 bg-primary/10 text-primary border-primary/20 font-bold animate-pulse">
                        {t('demo.badge')}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title={t('demo.stats.reach')}
                        value="128.4k"
                        icon={Users}
                        trend={{ value: t('demo.trends.reach'), positive: true }}
                    />
                    <StatCard
                        title={t('demo.stats.campaigns')}
                        value="14"
                        icon={Zap}
                        trend={{ value: t('demo.trends.campaigns'), positive: false }}
                    />
                    <StatCard
                        title={t('demo.stats.conversion')}
                        value="3.2%"
                        icon={TrendingUp}
                        trend={{ value: t('demo.trends.conversion'), positive: true }}
                    />
                    <StatCard
                        title={t('demo.stats.objectives')}
                        value="68%"
                        icon={Target}
                        trend={{ value: t('demo.trends.objectives'), positive: true }}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold">{t('demo.chart_title')}</CardTitle>
                                <p className="text-sm text-muted-foreground">{t('demo.chart_desc')}</p>
                            </div>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data}>
                                        <defs>
                                            <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
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
                                        <Area type="monotone" dataKey="reach" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorReach)" strokeWidth={3} />
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
                            {[
                                { title: t('demo.tasks.item1.title'), time: t('demo.tasks.item1.time'), status: "urgent" },
                                { title: t('demo.tasks.item2.title'), time: t('demo.tasks.item2.time'), status: "pending" },
                                { title: t('demo.tasks.item3.title'), time: t('demo.tasks.item3.time'), status: "upcoming" },
                                { title: t('demo.tasks.item4.title'), time: t('demo.tasks.item4.time'), status: "upcoming" }
                            ].map((task, i) => (
                                <div key={i} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-muted/50 transition-colors group cursor-default">
                                    <div className={`mt-1 h-2 w-2 rounded-full ${task.status === 'urgent' ? 'bg-red-500 animate-pulse' : 'bg-primary'}`} />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold group-hover:text-primary transition-colors">{task.title}</p>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            {task.time}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" className="w-full mt-4">{t('demo.see_agenda')}</Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="border-border/50 bg-card/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                                <h4 className="font-bold">{t('demo.features.analytics.title')}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">{t('demo.features.analytics.desc')}</p>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[75%]" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 bg-card/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <h4 className="font-bold">{t('demo.features.planner.title')}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">{t('demo.features.planner.desc')}</p>
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-primary/20 bg-primary/5 border-dashed">
                        <CardContent className="pt-6 flex flex-col items-center text-center justify-center min-h-[160px]">
                            <Sparkles className="h-8 w-8 text-primary mb-3" />
                            <h4 className="font-bold mb-1">{t('demo.pro.title')}</h4>
                            <p className="text-xs text-muted-foreground mb-4">{t('demo.pro.desc')}</p>
                            <Button size="sm" className="font-bold">{t('demo.pro.btn')}</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}

function Sparkles(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M19 17v4" />
            <path d="M3 5h4" />
            <path d="M17 19h4" />
        </svg>
    )
}
