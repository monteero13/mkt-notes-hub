'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  X,
  Calendar as CalendarIcon
} from "lucide-react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useTeam } from "@/hooks/use-features-data";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";

export default function PlanificadorPage() {
  const { t, i18n } = useTranslation();
  const { tasks = [], isLoading } = useDashboardData();
  const { data: team } = useTeam();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  const [isAddingTask, setIsAddingTask] = useState(false);
  
  const TASK_CATEGORIES = [
    { name: t('planificador.categories.content'), color: 'blue' },
    { name: t('planificador.categories.meeting'), color: 'purple' },
    { name: t('planificador.categories.strategy'), color: 'orange' },
    { name: t('planificador.categories.urgent'), color: 'red' },
  ];

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState(TASK_CATEGORIES[0]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  
  const supabase = createClient();
  const queryClient = useQueryClient();

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !selectedDay || !user) return;
    try {
      const dateStr = selectedDay.toISOString().split('T')[0];
      const { error } = await supabase.from('tasks').insert({
        user_id: user.id,
        title: newTaskTitle,
        due_date: dateStr,
        status: 'pending',
        priority: newTaskCategory.color === 'red' ? 'high' : 'medium',
        category_name: newTaskCategory.name,
        category_color: newTaskCategory.color,
        assignees: selectedAssignees,
        team_id: team?.id
      });
      
      if (error) throw error;
      toast.success(t('planificador.task_assigned'));
      setNewTaskTitle('');
      setSelectedAssignees([]);
      setIsAddingTask(false);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (e: any) {
      toast.error(t('common.error') + ": " + e.message);
    }
  };

  const toggleAssignee = (userId: string) => {
    setSelectedAssignees(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const daysLabels = t('planificador.days', { returnObjects: true }) as string[];
  
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    let startDayIdx = firstDayOfMonth.getDay() - 1;
    if (startDayIdx === -1) startDayIdx = 6; 
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < startDayIdx; i++) {
        const prevMonthDate = new Date(year, month, 0 - (startDayIdx - i - 1));
        days.push({ day: prevMonthDate.getDate(), date: prevMonthDate, isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, date: new Date(year, month, i), isCurrentMonth: true });
    }
    return days;
  }, [currentDate]);

  const monthName = currentDate.toLocaleString(i18n.language === 'es' ? 'es-ES' : 'en-US', { month: 'long', year: 'numeric' });

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const selectedDateStr = selectedDay ? selectedDay.toISOString().split('T')[0] : null;
  const dayEvents = useMemo(() => {
    if (!selectedDay) return [];
    const dateStr = selectedDay.toISOString().split('T')[0];
    return (tasks || []).filter((t: any) => t.due_date === dateStr);
  }, [selectedDay, tasks]);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-4 h-full flex flex-col overflow-hidden">
        <div className="flex items-center justify-between shrink-0">
            <PageHeader 
                title={t('planificador.title')} 
                description={t('planificador.desc')} 
            />
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-bold w-32 text-center uppercase">{monthName}</span>
              <Button variant="outline" size="icon" onClick={() => navigateMonth(1)} className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
           {/* Calendar Grid */}
           <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm flex flex-col min-h-0">
             <CardContent className="p-0 flex-1 flex flex-col min-h-0">
               <div className="grid grid-cols-7 border-b border-border/50 bg-muted/20 shrink-0">
                 {daysLabels.map(day => (
                   <div key={day} className="px-2 py-2 text-[10px] font-bold text-muted-foreground text-center">
                     {day}
                   </div>
                 ))}
               </div>
               <div className="grid grid-cols-7 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                 {calendarData.map((item, i) => {
                   const dateStr = item.date.toISOString().split('T')[0];
                   const isSelected = selectedDay && dateStr === selectedDateStr;
                   const isToday = new Date().toISOString().split('T')[0] === dateStr;
                   const cellTasks = (tasks || []).filter((t: any) => t.due_date === dateStr);

                   return (
                     <div 
                       key={i} 
                       onClick={() => setSelectedDay(item.date)}
                        className={cn(
                          "min-h-[85px] p-2 border-r border-b border-border/50 last:border-r-0 cursor-pointer transition-colors hover:bg-muted/50 flex flex-col",
                          !item.isCurrentMonth && "opacity-30 bg-muted/10",
                          isSelected && "bg-primary/5"
                        )}
                     >
                       <div className="flex justify-between items-start mb-1.5 shrink-0">
                          <span className={cn(
                            "h-5 w-5 flex items-center justify-center rounded-md text-[10px] font-medium",
                            isToday ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground",
                            isSelected && !isToday && "text-primary font-bold"
                          )}>
                            {item.day}
                          </span>
                       </div>
                       
                       <div className="space-y-1 flex-1 overflow-hidden">
                          {cellTasks.slice(0, 3).map((t: any, idx) => (
                            <div 
                              key={idx} 
                              className={cn(
                                "h-4 px-1.5 rounded text-[9px] font-medium truncate flex items-center text-primary-foreground",
                                `bg-${t.category_color || 'blue'}-500/80`
                              )}
                            >
                               {t.title}
                            </div>
                          ))}
                          {cellTasks.length > 3 && <p className="text-[9px] font-medium text-muted-foreground pl-1">+{cellTasks.length - 3} {t('common.more')}</p>}
                       </div>
                     </div>
                   );
                 })}
               </div>
             </CardContent>
           </Card>

           {/* Daily Detail View */}
           <Card className="border-border/50 bg-card/50 backdrop-blur-sm flex flex-col min-h-0">
              {selectedDay && (
                 <>
                   <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/50 shrink-0 py-3 px-4">
                       <div>
                           <CardTitle className="text-base font-bold">{selectedDay.getDate()} {t('common.of')} {selectedDay.toLocaleString(i18n.language === 'es' ? 'es-ES' : 'en-US', { month: 'long' })}</CardTitle>
                           <p className="text-[10px] text-muted-foreground">{dayEvents.length} {t('planificador.events_planned')}</p>
                       </div>
                       <Button 
                           onClick={() => setIsAddingTask(!isAddingTask)}
                           variant={isAddingTask ? "outline" : "default"}
                           size="icon"
                           className="h-7 w-7"
                       >
                           {isAddingTask ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                       </Button>
                   </CardHeader>
                   <CardContent className="flex-1 overflow-y-auto pt-4 space-y-4 px-4 custom-scrollbar pb-4">
                      {isAddingTask ? (
                         <div className="space-y-4">
                            <Input 
                                placeholder={t('planificador.task_placeholder')} 
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                className="h-9 text-xs"
                            />
                            <div className="flex flex-wrap gap-1.5">
                               {TASK_CATEGORIES.map(cat => (
                                 <Badge
                                   key={cat.name}
                                   variant={newTaskCategory.name === cat.name ? "default" : "outline"}
                                   className="cursor-pointer text-[10px] px-2 py-0 h-5"
                                   onClick={() => setNewTaskCategory(cat)}
                                 >
                                   {cat.name}
                                 </Badge>
                               ))}
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-medium text-muted-foreground">{t('planificador.assign_to')}:</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {team?.members?.map((member: any) => (
                                        <button
                                            key={member.user_id}
                                            onClick={() => toggleAssignee(member.user_id)}
                                            className={cn(
                                                "transition-all",
                                                selectedAssignees.includes(member.user_id) ? "ring-1 ring-primary rounded-full scale-105" : "opacity-50 grayscale hover:opacity-100"
                                            )}
                                        >
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={member.profiles?.avatar_url} />
                                                <AvatarFallback className="text-[8px]">{member.profiles?.full_name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <Button onClick={handleAddTask} className="w-full h-9 text-xs font-bold mt-2">
                                {t('planificador.save_task')}
                            </Button>
                         </div>
                      ) : (
                         <div className="space-y-2.5">
                            {dayEvents.length > 0 ? dayEvents.map((t: any) => (
                               <div key={t.id} className="flex flex-col gap-1.5 p-2.5 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border/50 transition-colors">
                                  <div className="flex items-center justify-between">
                                      <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 h-4 leading-none", `text-${t.category_color || 'blue'}-500 border-${t.category_color || 'blue'}-500/20`)}>
                                          {t.category_name || 'General'}
                                      </Badge>
                                      <div className="flex -space-x-1.5">
                                         {t.assignees?.map((uid: string) => {
                                            const member = team?.members?.find((m: any) => m.user_id === uid);
                                            return (
                                               <Avatar key={uid} className="h-5 w-5 border border-background">
                                                   <AvatarImage src={member?.profiles?.avatar_url} />
                                                   <AvatarFallback className="text-[7px]">{member?.profiles?.full_name?.charAt(0) || '?'}</AvatarFallback>
                                               </Avatar>
                                            )
                                         })}
                                      </div>
                                  </div>
                                  <p className="text-xs font-medium">{t.title}</p>
                               </div>
                            )) : (
                               <div className="py-8 text-center flex flex-col items-center justify-center text-muted-foreground">
                                   <CalendarIcon className="h-8 w-8 opacity-20 mb-3" />
                                   <p className="text-[10px]">{t('planificador.no_events')}</p>
                               </div>
                            )}
                         </div>
                      )}
                   </CardContent>
                 </>
              )}
           </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
