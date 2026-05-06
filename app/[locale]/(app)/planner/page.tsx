'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Calendar as CalendarIcon,
  Clock,
  ArrowUpRight,
  Hash,
  ChevronRight as ChevronRightSmall
} from "lucide-react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useWorkspace } from "@/hooks/use-workspace";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useCategories } from "@/hooks/use-categories";
import { ManageCategoriesDialog } from "@/components/ManageCategoriesDialog";
import { useTranslations, useLocale } from "next-intl";

export default function PlanificadorPage() {
  const t = useTranslations("planner");
  const tc = useTranslations("common");
  const locale = useLocale();
  
  const daysLabels = [
    tc("days_short.mon").toUpperCase(),
    tc("days_short.tue").toUpperCase(),
    tc("days_short.wed").toUpperCase(),
    tc("days_short.thu").toUpperCase(),
    tc("days_short.fri").toUpperCase(),
    tc("days_short.sat").toUpperCase(),
    tc("days_short.sun").toUpperCase(),
  ];

  const { tasks = [] } = useDashboardData();
  const { activeWorkspace } = useWorkspace();
  const isLeader = activeWorkspace?.role && !['viewer', 'client_guest'].includes(activeWorkspace.role);
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  const [isAddingTask, setIsAddingTask] = useState(false);

  const { data: categories = [], isLoading: isLoadingCats } = useCategories();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

  const supabase = createClient();
  const queryClient = useQueryClient();

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !selectedDay || !user || !activeWorkspace) return;
    try {
      const dateStr = selectedDay.toISOString().split('T')[0];
      const { error } = await supabase.from('tasks').insert({
        user_id: user.id,
        workspace_id: activeWorkspace.id,
        title: newTaskTitle,
        due_date: dateStr,
        status: 'pending',
        priority: selectedCategory?.color === 'red' ? 'high' : 'medium',
        category_name: selectedCategory?.name || 'General',
        category_color: selectedCategory?.color || '#3b82f6',
        assignees: selectedAssignees
      });

      if (error) throw error;
      toast.success(t("toast.success"));
      setNewTaskTitle('');
      setSelectedAssignees([]);
      setIsAddingTask(false);
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (e: any) {
      toast.error(tc("error") + ": " + e.message);
    }
  };

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

  const monthName = currentDate.toLocaleString(locale === 'es' ? 'es-ES' : 'en-US', { month: 'long', year: 'numeric' });

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
      <div className="flex flex-col h-full bg-background">
        {/* Top Control Bar */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="technical-label text-[11px] text-foreground">{t("header.title")}</div>
            <div className="h-4 w-[1px] bg-border" />
            <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              <span>{t("header.subtitle")}</span>
              <ChevronRightSmall size={12} className="opacity-60" />
              <span className="text-brand">{monthName}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-accent/5 border border-border rounded-sm overflow-hidden">
              <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-brand/10 hover:text-brand transition-colors border-r border-border">
                <ChevronLeft size={14} />
              </button>
              <div className="px-4 technical-label text-[9px] min-w-[120px] text-center">{monthName}</div>
              <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-brand/10 hover:text-brand transition-colors border-l border-border">
                <ChevronRight size={14} />
              </button>
            </div>
            {isLeader && <ManageCategoriesDialog />}
          </div>
        </div>

        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-4 min-h-0">
          {/* Main Grid View */}
          <div className="lg:col-span-3 flex flex-col min-h-0 border-r border-border">
            <div className="grid grid-cols-7 border-b border-border bg-accent/5">
              {daysLabels.map(day => (
                <div key={day} className="px-3 py-3 technical-label text-[9px] text-muted-foreground/60 text-center border-r border-border last:border-r-0">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 flex-1 overflow-y-auto custom-scrollbar">
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
                      "min-h-[120px] p-2 border-r border-b border-border/40 last:border-r-0 cursor-pointer transition-all flex flex-col gap-2 group",
                      !item.isCurrentMonth && "opacity-40 bg-accent/5",
                      isSelected && "bg-brand/[0.03] ring-1 ring-inset ring-brand/20 z-10",
                      item.isCurrentMonth && "hover:bg-accent/5"
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <span className={cn(
                        "h-6 w-6 flex items-center justify-center technical-label text-[10px] rounded-sm",
                        isToday ? "bg-brand text-white" : "text-muted-foreground/60",
                        isSelected && !isToday && "text-brand font-black"
                      )}>
                        {item.day}
                      </span>
                      {cellTasks.length > 0 && (
                        <div className="technical-label text-[8px] opacity-40">{cellTasks.length} {t("calendar.units")}</div>
                      )}
                    </div>

                    <div className="space-y-1 flex-1">
                      {cellTasks.slice(0, 4).map((t_item: any, idx) => (
                        <div
                          key={idx}
                          className="h-4 px-2 border-l-2 text-[8px] font-black uppercase tracking-tighter truncate flex items-center bg-accent/5 border-border"
                          style={{ borderLeftColor: t_item.category_color || '#7C3AED' }}
                        >
                          {t_item.title}
                        </div>
                      ))}
                      {cellTasks.length > 4 && (
                        <div className="text-[7px] font-black text-brand/60 ml-1">
                          {t("calendar.more_units", { count: cellTasks.length - 4 })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tactical Side Panel */}
          <div className="flex flex-col min-h-0 bg-card/30">
            {selectedDay && (
              <>
                <div className="p-4 sm:p-6 border-b border-border bg-accent/5 flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="technical-label text-brand text-[9px]">{t("side_panel.title")}</div>
                    <h2 className="text-xl font-black tracking-tighter uppercase leading-none">
                      {selectedDay.getDate()} {selectedDay.toLocaleString(locale === 'es' ? 'es-ES' : 'en-US', { month: 'short' }).toUpperCase()}
                    </h2>
                  </div>
                  <Button
                    onClick={() => setIsAddingTask(!isAddingTask)}
                    size="icon"
                    className={cn("h-8 w-8 rounded-sm", isAddingTask ? "bg-accent/10 text-foreground" : "bg-brand text-white")}
                  >
                    {isAddingTask ? <X size={14} /> : <Plus size={14} />}
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {isAddingTask ? (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                      <div className="space-y-1.5">
                        <label className="technical-label text-[8px] opacity-60 ml-1">{t("side_panel.add.objective_label")}</label>
                        <Input
                          placeholder={t("side_panel.add.objective_placeholder")}
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          className="h-10 rounded-sm border-border bg-card text-[11px] font-bold"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="technical-label text-[8px] opacity-60 ml-1">{t("side_panel.add.category_label")}</label>
                        <div className="flex flex-wrap gap-2">
                          {categories.map((cat: any) => (
                            <button
                              key={cat.id}
                              type="button"
                              className={cn(
                                "px-3 py-1.5 rounded-sm technical-label text-[8px] border transition-all",
                                selectedCategory?.id === cat.id ? "border-brand bg-brand/5 text-brand" : "border-border opacity-60 hover:opacity-100"
                              )}
                              onClick={() => setSelectedCategory(cat)}
                            >
                              {cat.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <Button onClick={handleAddTask} className="w-full h-10 rounded-sm bg-brand text-white technical-label text-[10px] font-black uppercase">
                        {t("side_panel.add.submit")}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {dayEvents.length > 0 ? dayEvents.map((t_item: any) => (
                        <div key={t_item.id} className="group flex flex-col gap-3 p-4 border border-border bg-card rounded-sm hover:border-brand transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Hash size={10} className="text-brand" />
                              <span className="technical-label text-[8px] opacity-60">{t_item.category_name || t("side_panel.task.default_category")}</span>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/60 hover:text-brand">
                              <ArrowUpRight size={12} />
                            </button>
                          </div>
                          <p className="text-[11px] font-black uppercase tracking-tight text-foreground leading-normal">{t_item.title}</p>
                          <div className="flex items-center gap-2 pt-3 border-t border-border/50">
                            <Clock size={10} className="text-muted-foreground/60" />
                            <span className="technical-label text-[8px] opacity-60">{t("side_panel.task.time")}</span>
                          </div>
                        </div>
                      )) : (
                        <div className="h-[40vh] flex flex-col items-center justify-center text-muted-foreground/40 gap-3 border border-dashed border-border rounded-sm">
                          <CalendarIcon size={32} />
                          <span className="technical-label text-[9px] uppercase tracking-widest">{t("side_panel.empty")}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

