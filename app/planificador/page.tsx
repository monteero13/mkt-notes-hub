'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2, Target, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useContent } from "@/hooks/use-features-data";
import { useMemo, useState } from "react";

export default function PlanificadorPage() {
  const { campaigns, isLoading: loadingCamps } = useDashboardData();
  const { data: content = [], isLoading: loadingContent } = useContent();
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysLabels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    let startDayIdx = firstDayOfMonth.getDay() - 1;
    if (startDayIdx === -1) startDayIdx = 6; 

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < startDayIdx; i++) {
      days.push({ day: null, date: null });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, date: new Date(year, month, i) });
    }

    return days;
  }, [currentDate]);

  const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const isLoading = loadingCamps || loadingContent;

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <PageHeader title="Planificador Estratégico" description="Monitoriza tus hitos críticos y fechas de lanzamiento.">
          <div className="flex items-center gap-4 bg-muted/20 p-2 rounded-2xl border border-border/40">
             <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)} className="rounded-xl">
               <ChevronLeft className="h-4 w-4" />
             </Button>
             <span className="text-[10px] font-black uppercase tracking-widest min-w-[120px] text-center">{monthName}</span>
             <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)} className="rounded-xl">
               <ChevronRight className="h-4 w-4" />
             </Button>
          </div>
        </PageHeader>

        {/* Calendar Container - Fixed Background */}
        <div className="rounded-[3rem] border border-border/60 bg-card overflow-hidden shadow-2xl shadow-black/20">
           {/* Header Días */}
           <div className="grid grid-cols-7 border-b border-border/60 bg-black/20">
              {daysLabels.map(day => (
                <div key={day} className="px-4 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/80 text-center border-r border-border/20 last:border-0">
                  {day}
                </div>
              ))}
           </div>
           
           {/* Grid Días - Higher Contrast */}
           <div className="grid grid-cols-7 min-h-[750px]">
              {calendarData.map((item, i) => {
                const dayDate = item.date;
                const dateStr = dayDate ? dayDate.toISOString().split('T')[0] : null;
                
                const activeEvents = [
                  ...campaigns.filter((c: any) => c.created_at.startsWith(dateStr)),
                  ...content.filter((cn: any) => cn.date === dateStr)
                ];

                return (
                  <div key={i} className={`p-5 border-r border-b border-border/10 last:border-r-0 group hover:bg-primary/[0.03] transition-all relative ${!item.day ? 'bg-muted/5' : ''}`}>
                    {item.day && (
                      <span className={`text-sm font-black tracking-tighter ${activeEvents.length > 0 ? 'text-primary' : 'text-card-foreground/40'}`}>
                        {item.day.toString().padStart(2, '0')}
                      </span>
                    )}
                    
                    <div className="mt-4 space-y-2">
                       {activeEvents.map((ev: any, idx) => (
                         <div 
                           key={idx} 
                           className={`p-2.5 rounded-xl text-[9px] font-black truncate uppercase tracking-tight border transition-all hover:scale-105 shadow-sm flex items-center gap-2 ${
                             ev.url ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                           }`}
                         >
                            {ev.url ? <PenTool className="h-3 w-3" /> : <Target className="h-3 w-3" />}
                            {ev.name || ev.title}
                         </div>
                       ))}
                    </div>
                  </div>
                );
              })}
           </div>
        </div>

        <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 flex items-center gap-6">
           <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
              <CalendarIcon className="h-6 w-6 text-primary" />
           </div>
           <div className="space-y-1">
             <p className="font-bold text-sm text-card-foreground uppercase tracking-tight">Sincronización Automática</p>
             <p className="text-xs text-muted-foreground/60 leading-relaxed max-w-2xl">
               Los hitos se sitúan automáticamente según su fecha de origen. Las campañas aparecen en azul y el contenido editorial en verde para una distinción estratégica inmediata.
             </p>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
