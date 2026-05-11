'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
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
  ChevronRight as ChevronRightSmall,
  Instagram,
  Youtube,
  Linkedin,
  Facebook,
  Twitter,
  Mail,
  Globe,
  MessageSquare,
  CheckCircle,
  Trash2
} from "lucide-react";
import { useWorkspace } from "@/hooks/use-workspace";
import { useTasks, useContent } from "@/hooks/use-features-data";
import { useMemo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCategories } from "@/hooks/use-categories";
import { ManageCategoriesDialog } from "@/components/ManageCategoriesDialog";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const { activeWorkspace } = useWorkspace();
  const isLeader = activeWorkspace?.role && !['viewer', 'client_guest'].includes(activeWorkspace.role);
  
  // Custom states
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  const [plannerFilter, setPlannerFilter] = useState<'all' | 'tasks' | 'publications'>('all');
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);

  // Fetching unified data
  const { data: tasks = [], createTask, updateTask, deleteTask } = useTasks();
  const { data: publications = [] } = useContent();
  const { data: categories = [] } = useCategories();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

  // Beautiful Helper to get social icon
  const getSocialIcon = (channel: string) => {
    const c = channel?.toLowerCase();
    switch (c) {
      case 'instagram': return <Instagram className="h-3 w-3 text-[#e1306c]" />;
      case 'youtube': return <Youtube className="h-3 w-3 text-[#ff0000]" />;
      case 'linkedin': return <Linkedin className="h-3 w-3 text-[#0077b5]" />;
      case 'facebook': return <Facebook className="h-3 w-3 text-[#1877f2]" />;
      case 'twitter': case 'x': return <Twitter className="h-3 w-3 text-[#1da1f2]" />;
      case 'email': return <Mail className="h-3 w-3 text-[#5266eb]" />;
      case 'blog': return <Globe className="h-3 w-3 text-[#ff5722]" />;
      default: return <MessageSquare className="h-3 w-3 text-brand" />;
    }
  };

  // Unify and filter events (Tasks + Content Items)
  const calendarEvents = useMemo(() => {
    const list: any[] = [];

    if (plannerFilter === 'all' || plannerFilter === 'tasks') {
      tasks.forEach((t_item: any) => {
        list.push({
          id: t_item.id,
          type: 'task',
          title: t_item.title,
          date: t_item.due_date ? t_item.due_date.split('T')[0] : null,
          status: t_item.status,
          priority: t_item.priority,
          category_color: t_item.category_color || '#7C3AED',
          category_name: t_item.category_name || 'Tarea',
          raw: t_item,
        });
      });
    }

    if (plannerFilter === 'all' || plannerFilter === 'publications') {
      publications.forEach((pub: any) => {
        let pubDateStr = null;
        if (pub.date) {
          pubDateStr = pub.date;
        } else if (pub.scheduled_at) {
          pubDateStr = pub.scheduled_at.split('T')[0];
        } else if (pub.published_at) {
          pubDateStr = pub.published_at.split('T')[0];
        } else if (pub.created_at) {
          pubDateStr = pub.created_at.split('T')[0];
        }

        list.push({
          id: pub.id,
          type: 'publication',
          title: pub.title,
          date: pubDateStr,
          status: pub.status,
          channel: pub.channel || 'instagram',
          raw: pub,
        });
      });
    }

    return list;
  }, [tasks, publications, plannerFilter]);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !selectedDay || !activeWorkspace) return;
    try {
      const dateStr = selectedDay.toISOString().split('T')[0];
      await createTask({
        title: newTaskTitle.trim(),
        due_date: dateStr,
        status: 'todo',
        priority: selectedCategory?.color === '#ef4444' ? 'high' : 'medium',
        assignee_id: selectedAssignees[0] ?? null,
        category_name: selectedCategory?.name || null,
        category_color: selectedCategory?.color || null
      });

      toast.success(t("toast.success") || "Tarea añadida con éxito");
      setNewTaskTitle('');
      setSelectedCategory(null);
      setSelectedAssignees([]);
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
    return calendarEvents.filter((e: any) => e.date === dateStr);
  }, [selectedDay, calendarEvents]);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-background">
        {/* Top Control Bar */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-8 gap-4 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-4">
            <div className="technical-label text-[11px] text-foreground">{t("header.title")}</div>
            <div className="h-4 w-[1px] bg-border hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              <span>{t("header.subtitle")}</span>
              <ChevronRightSmall size={12} className="opacity-60" />
              <span className="text-brand">{monthName}</span>
            </div>
          </div>

          {/* Unified Filters inside Top Control Bar */}
          <div className="flex items-center gap-3">
            <div className="flex bg-accent/10 p-0.5 rounded-lg border border-border">
              <button
                onClick={() => setPlannerFilter('all')}
                className={cn(
                  "px-3 py-1.5 technical-label text-[8.5px] rounded-sm uppercase tracking-wider transition-all",
                  plannerFilter === 'all' ? "bg-card text-foreground shadow-sm font-black" : "text-muted-foreground/60 hover:text-foreground"
                )}
              >
                Ver Todo
              </button>
              <button
                onClick={() => setPlannerFilter('tasks')}
                className={cn(
                  "px-3 py-1.5 technical-label text-[8.5px] rounded-sm uppercase tracking-wider transition-all",
                  plannerFilter === 'tasks' ? "bg-card text-foreground shadow-sm font-black" : "text-muted-foreground/60 hover:text-foreground"
                )}
              >
                Tareas
              </button>
              <button
                onClick={() => setPlannerFilter('publications')}
                className={cn(
                  "px-3 py-1.5 technical-label text-[8.5px] rounded-sm uppercase tracking-wider transition-all",
                  plannerFilter === 'publications' ? "bg-card text-foreground shadow-sm font-black" : "text-muted-foreground/60 hover:text-foreground"
                )}
              >
                Social
              </button>
            </div>

            <div className="flex items-center bg-accent/5 border border-border rounded-lg overflow-hidden">
              <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-brand/10 hover:text-brand transition-colors border-r border-border">
                <ChevronLeft size={14} />
              </button>
              <div className="px-4 technical-label text-[9px] min-w-[120px] text-center uppercase tracking-wider font-bold">{monthName}</div>
              <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-brand/10 hover:text-brand transition-colors border-l border-border">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-4 min-h-0">
          {/* Main Grid View */}
          <div className="lg:col-span-3 flex flex-col min-h-0 border-r border-border">
            <div className="grid grid-cols-7 border-b border-border bg-accent/5">
              {daysLabels.map(day => (
                <div key={day} className="px-3 py-3 technical-label text-[9px] text-muted-foreground/60 text-center border-r border-border last:border-r-0 uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 flex-1 overflow-y-auto custom-scrollbar">
              {calendarData.map((item, i) => {
                const dateStr = item.date.toISOString().split('T')[0];
                const isSelected = selectedDay && dateStr === selectedDateStr;
                const isToday = new Date().toISOString().split('T')[0] === dateStr;
                const cellEvents = calendarEvents.filter((e: any) => e.date === dateStr);

                return (
                  <div
                    key={i}
                    onClick={() => setSelectedDay(item.date)}
                    className={cn(
                      "min-h-[120px] p-1.5 border-r border-b border-border/40 last:border-r-0 cursor-pointer transition-all flex flex-col gap-2 group",
                      !item.isCurrentMonth && "opacity-40 bg-accent/5",
                      isSelected && "bg-brand/[0.03] ring-1 ring-inset ring-brand/20 z-10",
                      item.isCurrentMonth && "hover:bg-accent/5"
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <span className={cn(
                        "h-6 w-6 flex items-center justify-center technical-label text-[10px] rounded-lg transition-all",
                        isToday ? "bg-brand text-white shadow-md shadow-brand/20" : "text-muted-foreground/60",
                        isSelected && !isToday && "text-brand font-black"
                      )}>
                        {item.day}
                      </span>
                      {cellEvents.length > 0 && (
                        <div className="technical-label text-[8px] opacity-40">{cellEvents.length} {t("calendar.units")}</div>
                      )}
                    </div>

                    {/* Integrated Events Inside Cells */}
                    <div className="space-y-1 flex-1 overflow-hidden">
                      {cellEvents.slice(0, 4).map((e_item: any, idx) => {
                        if (e_item.type === 'publication') {
                          return (
                            <div
                              key={idx}
                              className={cn(
                                "h-[19px] px-1.5 border-l-2 text-[8px] font-bold uppercase tracking-tight truncate flex items-center gap-1.5 rounded-r-md transition-all hover:scale-[1.02]",
                                `social-item-${e_item.channel}`
                              )}
                            >
                              {getSocialIcon(e_item.channel)}
                              <span className="truncate flex-1 text-foreground/80">{e_item.title}</span>
                            </div>
                          );
                        } else {
                          return (
                            <div
                              key={idx}
                              className={cn(
                                "h-[19px] px-1.5 border-l-2 text-[8px] font-semibold uppercase tracking-tight truncate flex items-center gap-1 rounded-r-md bg-accent/10 border-border transition-all hover:scale-[1.02]",
                                e_item.status === 'done' && "opacity-45 line-through"
                              )}
                              style={{ borderLeftColor: e_item.category_color || '#7C3AED' }}
                            >
                              <CheckCircle size={8} className={cn("shrink-0", e_item.status === 'done' ? "text-success" : "text-muted-foreground/30")} />
                              <span className="truncate flex-1 text-foreground/80">{e_item.title}</span>
                            </div>
                          );
                        }
                      })}
                      {cellEvents.length > 4 && (
                        <div className="text-[7.5px] font-black text-brand/60 ml-1 uppercase tracking-tight">
                          +{cellEvents.length - 4} más
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tactical Side Panel with Inline Fast Task */}
          <div className="flex flex-col min-h-0 bg-card/30">
            {selectedDay && (
              <>
                <div className="p-4 sm:p-6 border-b border-border bg-accent/5">
                  <div className="flex flex-col gap-1">
                    <div className="technical-label text-brand text-[9px] uppercase tracking-widest">{t("side_panel.title") || "Planificación"}</div>
                    <h2 className="text-xl font-black tracking-tighter uppercase leading-none">
                      {selectedDay.getDate()} {selectedDay.toLocaleString(locale === 'es' ? 'es-ES' : 'en-US', { month: 'short' }).toUpperCase()}
                    </h2>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-4 sm:space-y-6">
                  
                  {/* Unified Direct Task Creator Form */}
                  <div className="space-y-4 border-b border-border/40 pb-6 mb-2">
                    <div className="technical-label text-[8.5px] uppercase tracking-widest font-black text-brand">
                      {locale === "es" ? "Nueva Tarea" : "New Task"}
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="technical-label text-[8px] opacity-60 ml-1 uppercase tracking-wider">{t("side_panel.add.objective_label")}</label>
                      <Input
                        placeholder={t("side_panel.add.objective_placeholder")}
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="h-10 rounded-lg border-border bg-card text-[11px] font-bold uppercase tracking-tight"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTask();
                          }
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="technical-label text-[8px] opacity-60 ml-1 uppercase tracking-wider">{t("side_panel.add.category_label")}</label>
                      <Select
                        value={selectedCategory?.id || "no_category"}
                        onValueChange={(val) => {
                          if (val === "create_new") {
                            setIsManageCategoriesOpen(true);
                          } else if (val === "no_category") {
                            setSelectedCategory(null);
                          } else {
                            const found = categories.find((c: any) => c.id === val);
                            setSelectedCategory(found || null);
                          }
                        }}
                      >
                        <SelectTrigger className="h-10 w-full rounded-lg border-border bg-card text-[11px] font-bold uppercase tracking-tight px-3">
                          <SelectValue placeholder="Seleccionar tipo de tarea..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg border-border bg-card max-h-[250px] overflow-y-auto">
                          <SelectItem value="no_category" className="technical-label text-[10px] uppercase">
                            {locale === "es" ? "Sin Tipo" : "No Type"}
                          </SelectItem>
                          {categories.map((cat: any) => (
                            <SelectItem key={cat.id} value={cat.id} className="technical-label text-[10px] uppercase">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: cat.color }} />
                                <span>{cat.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                          {isLeader && (
                            <SelectItem value="create_new" className="technical-label text-[10px] uppercase text-brand font-black border-t border-border mt-1 pt-2 cursor-pointer">
                              <span className="flex items-center gap-1.5 text-brand">
                                <Plus size={12} className="shrink-0" />
                                {locale === "es" ? "Crear nuevo tipo..." : "Create new type..."}
                              </span>
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={handleAddTask} className="w-full h-10 rounded-lg bg-brand text-white technical-label text-[10px] font-black uppercase tracking-widest shadow-md shadow-brand/10 hover:shadow-brand/20">
                      {t("side_panel.add.submit")}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="technical-label text-[8.5px] uppercase tracking-widest font-black text-muted-foreground/60">
                      {locale === "es" ? "Actividades del Día" : "Day Activities"}
                    </div>
                      {dayEvents.length > 0 ? (
                        dayEvents.map((e_item: any) => {
                          if (e_item.type === 'task') {
                            return (
                              <div
                                key={e_item.id}
                                className={cn(
                                  "group flex flex-col gap-2 p-3.5 border border-border bg-card rounded-lg hover:border-brand/40 hover:shadow-md transition-all duration-300 relative overflow-hidden",
                                  e_item.status === 'done' && "opacity-55 border-border/50"
                                )}
                              >
                                {/* Left Color Accent Bar */}
                                <div
                                  className="absolute left-0 top-0 bottom-0 w-1"
                                  style={{ backgroundColor: e_item.category_color || '#7C3AED' }}
                                />
                                
                                <div className="flex items-start gap-3">
                                  <input
                                    type="checkbox"
                                    checked={e_item.status === 'done'}
                                    onChange={async (chkEvt) => {
                                      const isChecked = chkEvt.target.checked;
                                      await updateTask({
                                        id: e_item.id,
                                        status: isChecked ? 'done' : 'todo'
                                      });
                                      toast.success(isChecked ? "Tarea completada" : "Tarea reactivada");
                                    }}
                                    className="custom-checkbox shrink-0 mt-0.5"
                                  />
                                  
                                  <div className="flex-1 min-w-0">
                                    <p className={cn(
                                      "text-[11px] font-bold uppercase tracking-tight text-foreground leading-snug transition-all duration-300",
                                      e_item.status === 'done' && "line-through text-muted-foreground/70"
                                    )}>
                                      {e_item.title}
                                    </p>
                                    
                                    <div className="flex items-center gap-3 mt-2 text-[8px] technical-label text-muted-foreground/60">
                                      <span className="px-1.5 py-0.5 bg-accent/10 border border-border/50 rounded-md uppercase font-bold">
                                        {e_item.category_name}
                                      </span>
                                      {e_item.priority && (
                                        <span className={cn(
                                          "px-1.5 py-0.5 rounded-md uppercase border font-bold",
                                          e_item.priority === 'high' ? "bg-error/5 border-error/20 text-error" : "bg-accent/10 border-border/50"
                                        )}>
                                          {e_item.priority}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <button
                                    onClick={async () => {
                                      if (confirm("¿Estás seguro de que deseas eliminar esta tarea?")) {
                                        await deleteTask(e_item.id);
                                        toast.success("Tarea eliminada");
                                      }
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/40 hover:text-error p-1 self-start"
                                    title="Eliminar tarea"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            );
                          } else {
                            // Render social publication event
                            return (
                              <div
                                key={e_item.id}
                                className={cn(
                                  "group flex flex-col gap-2.5 p-3.5 border bg-card rounded-lg hover:border-brand/40 hover:shadow-md transition-all duration-300 relative overflow-hidden",
                                  `social-item-${e_item.channel}`
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    {getSocialIcon(e_item.channel)}
                                    <span className="technical-label text-[8px] uppercase font-black text-muted-foreground tracking-wider">
                                      {e_item.channel}
                                    </span>
                                  </div>
                                  <span className={cn(
                                    "text-[8px] technical-label uppercase px-1.5 py-0.5 rounded-md border font-bold",
                                    e_item.status === 'published' ? "bg-success/5 border-success/20 text-success" :
                                    e_item.status === 'scheduled' ? "bg-brand/5 border-brand/20 text-brand" : "bg-accent/10 border-border/50 text-muted-foreground"
                                  )}>
                                    {e_item.status}
                                  </span>
                                </div>
                                
                                <p className="text-[11px] font-black uppercase tracking-tight text-foreground leading-snug">
                                  {e_item.title}
                                </p>

                                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                  <div className="flex items-center gap-1.5 text-[8px] technical-label text-muted-foreground/60">
                                    <Clock size={10} />
                                    <span>Publicación Social</span>
                                  </div>
                                  <Link
                                    href="/content"
                                    className="text-[8px] technical-label text-brand hover:underline flex items-center gap-0.5 font-bold uppercase tracking-wider"
                                  >
                                    Ver en Matriz <ArrowUpRight size={10} />
                                  </Link>
                                </div>
                              </div>
                            );
                          }
                        })
                      ) : (
                        <div className="h-[40vh] flex flex-col items-center justify-center text-muted-foreground/30 gap-3 border border-dashed border-border/80 rounded-lg">
                          <CalendarIcon size={32} className="opacity-60" />
                          <span className="technical-label text-[9px] uppercase tracking-widest font-black">{t("side_panel.empty") || "Sin Actividades"}</span>
                        </div>
                      )}
                    </div>
                  </div>
              </>
            )}
          </div>
        </div>
      </div>
      <ManageCategoriesDialog
        open={isManageCategoriesOpen}
        onOpenChange={setIsManageCategoriesOpen}
        trigger={null}
      />
    </DashboardLayout>
  );
}
