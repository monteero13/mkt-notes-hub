'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { 
  Rocket, 
  Target, 
  PenTool, 
  Lightbulb, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Plus, 
  ArrowUpRight, 
  ChevronRight,
  Circle
} from "lucide-react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useContent, useIdeas, useObjectives } from "@/hooks/use-features-data";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const { campaigns } = useDashboardData();
  const { data: content = [] } = useContent();
  const { data: ideas = [] } = useIdeas();
  const { data: objectives = [] } = useObjectives();

  // Nombre para el saludo
  const firstName = profile?.full_name?.split(' ')[0] || 'Usuario';

  // Onboarding Logic
  const onboardingSteps = [
    { id: 'camp', label: 'Lanza tu primera campaña', completed: campaigns.length > 0, link: '/campanas' },
    { id: 'content', label: 'Planifica una pieza de contenido', completed: content.length > 0, link: '/contenido' },
    { id: 'idea', label: 'Captura una idea creativa', completed: ideas.length > 0, link: '/ideas' },
    { id: 'obj', label: 'Define un objetivo estratégico', completed: objectives.length > 0, link: '/objetivos' },
  ];

  const onboardingProgress = Math.round((onboardingSteps.filter(s => s.completed).length / onboardingSteps.length) * 100);

  return (
    <DashboardLayout>
      <div className="space-y-10 p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto">
        
        {/* Welcome Area */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-card-foreground">
              ¡Hola, {firstName}! 👋
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">Aquí tienes el pulso real de tu ecosistema de marketing.</p>
          </div>
          <div className="flex gap-3">
             <CreateTaskDialog>
                <Button className="rounded-2xl h-14 px-8 bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 transition-all font-black uppercase text-xs tracking-widest gap-3">
                   <Plus className="h-5 w-5" /> Nueva Misión
                </Button>
             </CreateTaskDialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Stats & Onboarding */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Quick Stats Bento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-card/50 backdrop-blur-md border border-blue-500/20 p-8 rounded-[2.5rem] flex flex-col justify-between h-[180px] hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all group">
                  <div className="flex justify-end">
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-5xl font-black text-foreground tracking-tighter group-hover:text-blue-500 transition-colors">{campaigns.length}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Estrategias</p>
                  </div>
               </div>
               
               <div className="bg-card/50 backdrop-blur-md border border-orange-500/20 p-8 rounded-[2.5rem] flex flex-col justify-between h-[180px] hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.1)] transition-all group">
                  <div className="flex justify-end">
                    <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-5xl font-black text-foreground tracking-tighter group-hover:text-orange-500 transition-colors">{content.length}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Contenidos</p>
                  </div>
               </div>

               <div className="bg-card/50 backdrop-blur-md border border-green-500/20 p-8 rounded-[2.5rem] flex flex-col justify-between h-[180px] hover:border-green-500/50 hover:shadow-[0_0_30_rgba(34,197,94,0.1)] transition-all group">
                  <div className="flex justify-end">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-5xl font-black text-foreground tracking-tighter group-hover:text-green-500 transition-colors">{objectives.length}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Objetivos</p>
                  </div>
               </div>
            </div>

            {/* Strategic Feed */}
            <div className="bg-card border border-border/50 rounded-[3rem] p-10 shadow-sm overflow-hidden relative">
               <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6 text-primary" />
                    <h3 className="text-2xl font-black uppercase tracking-tighter">Plan de Vuelo</h3>
                  </div>
                  <Link href="/campanas" className="text-xs font-black uppercase tracking-widest text-primary hover:underline">Ver todo</Link>
               </div>

               <div className="space-y-6">
                 {campaigns.length > 0 ? (
                   campaigns.slice(0, 3).map((c: any) => (
                     <div key={c.id} className="flex items-center justify-between p-6 bg-muted/20 border border-border/30 rounded-3xl hover:bg-muted/40 transition-all">
                        <div className="flex items-center gap-6">
                           <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center font-black text-primary">
                             {c.progress}%
                           </div>
                           <div>
                             <h4 className="font-bold text-lg">{c.name}</h4>
                             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{c.channel || 'Canal General'}</p>
                           </div>
                        </div>
                        <div className="h-2 w-32 bg-muted rounded-full overflow-hidden hidden md:block">
                          <div className="h-full bg-primary" style={{ width: `${c.progress}%` }} />
                        </div>
                     </div>
                   ))
                 ) : (
                    <div className="py-20 text-center">
                      <p className="text-muted-foreground italic">No hay estrategias en curso...</p>
                    </div>
                 )}
               </div>
            </div>
          </div>

          {/* RIGHT: Onboarding & Tasks */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Onboarding Checklist - Solo se muestra si no está al 100% */}
            {onboardingProgress < 100 && (
              <div className="p-10 rounded-[3rem] border-2 bg-primary/5 border-primary/20 transition-all">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black uppercase tracking-tighter text-foreground">Guía de Inicio</h3>
                  <span className="text-lg font-black text-primary">{onboardingProgress}%</span>
                </div>
                
                <div className="h-3 bg-muted rounded-full mb-10 overflow-hidden border border-border/30">
                  <div 
                    className="h-full bg-primary transition-all duration-1000" 
                    style={{ width: `${onboardingProgress}%` }} 
                  />
                </div>

                <div className="space-y-5">
                  {onboardingSteps.map((step) => (
                    <Link 
                      key={step.id} 
                      href={step.link}
                      className={`flex items-center gap-4 group transition-all ${step.completed ? 'opacity-40 grayscale pointer-events-none' : 'hover:translate-x-2'}`}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
                      ) : (
                        <Circle className="h-6 w-6 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                      )}
                      <span className={`text-[13px] font-bold tracking-tight ${step.completed ? 'line-through' : 'text-card-foreground'}`}>
                        {step.label}
                      </span>
                      {!step.completed && <ChevronRight className="h-4 w-4 ml-auto text-primary opacity-0 group-hover:opacity-100" />}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Capturas Creativas (Renombrado de Inspiración) */}
            <div className={`bg-card/50 backdrop-blur-md border border-border/50 rounded-[3rem] p-10 ${onboardingProgress === 100 ? 'lg:mt-0' : ''}`}>
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Lightbulb className="h-6 w-6 text-orange-500" />
                    <h3 className="text-xl font-black uppercase tracking-tighter text-foreground">Creatividad</h3>
                  </div>
                  <Link href="/ideas" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Ver Banco</Link>
               </div>
               <p className="text-[10px] text-muted-foreground/60 mb-6 uppercase font-bold tracking-widest">Últimos conceptos capturados:</p>
               <div className="space-y-4">
                  {ideas.length > 0 ? (
                    ideas.slice(0, 3).map((i: any) => (
                      <div key={i.id} className="p-5 bg-muted/20 border border-border/20 rounded-2xl italic text-sm text-card-foreground/80 hover:bg-muted/30 transition-colors">
                        "{i.title}"
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center bg-muted/10 rounded-2xl border border-dashed border-border/40">
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Sin ideas pendientes</p>
                    </div>
                  )}
               </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
