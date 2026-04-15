'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowRight,
  BookOpen,
  Users,
  Target,
  BarChart3,
  Star,
  Layers,
  ChevronRight,
  Monitor,
  ShieldCheck,
  LayoutDashboard
} from "lucide-react";
import { DeveloperSignature } from "@/components/DeveloperSignature";
import { ThemeToggle } from "@/components/ThemeToggle";

const features = [
  {
    id: "org",
    title: "Organización Total",
    desc: "Reemplaza el caos de las agendas físicas por un sistema centralizado. Todo tu marketing en un solo lugar.",
    icon: BookOpen,
    image: "/feature-org.png?v=1",
    accent: "bg-blue-500"
  },
  {
    id: "collab",
    title: "Sincronización de Equipos",
    desc: "Coordina a tu equipo sin fricciones. Asigna tareas y mantén a todos alineados con los objetivos.",
    icon: Users,
    image: "/feature-collab.png?v=1",
    accent: "bg-purple-500"
  },
  {
    id: "analytics",
    title: "Análisis de Impacto",
    desc: "Lo que no se mide no se mejora. Obtén informes visuales críticos sobre el rendimiento.",
    icon: BarChart3,
    image: "/feature-analytics.png?v=1",
    accent: "bg-indigo-500"
  },
  {
    id: "security",
    title: "Seguridad y Nube",
    desc: "Tus datos están protegidos con cifrado de grado empresarial. Copias de seguridad automáticas.",
    icon: ShieldCheck,
    image: "/feature-security.png?v=1",
    accent: "bg-slate-800"
  }
];

export default function LandingPage() {
  const [user, setUser] = useState<any>(null);
  const [activeFeature, setActiveFeature] = useState(features[0]);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-primary/20 font-sans transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
             <img src="/logo.png" alt="mkt.notes" className="h-9 w-auto dark:invert" />
            <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white font-heading">mkt.notes</span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            <a href="#soluciones" className="hover:text-primary transition-colors">Soluciones</a>
            <Link href="/demo" className="hover:text-primary transition-colors">Demo</Link>
            <Link href="/pricing" className="hover:text-primary transition-colors">Planes</Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user ? (
               <Link href="/dashboard">
                  <Button className="font-bold px-6 py-5 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all text-xs uppercase tracking-widest">
                    Dashboard
                  </Button>
               </Link>
            ) : (
              <>
                <Link href="/login?mode=login" className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-primary px-4 transition-colors tracking-widest">
                  LOGIN
                </Link>
                <Link href="/login?mode=signup&plan=pro">
                  <Button className="font-bold px-6 py-5 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-950 hover:bg-slate-800 transition-all text-xs uppercase tracking-widest">
                    Comenzar
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main>
        {/* Modern Hero */}
        <section className="relative pt-48 pb-32 overflow-hidden bg-slate-50/50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="max-w-4xl">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-10">
                  Transformación Digital 2026
                </span>
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] text-slate-950 dark:text-white mb-10 font-heading">
                  De la agenda física a la <span className="text-primary italic">eficiencia digital.</span>
                </h1>
                <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed mb-12">
                   Organiza tu estrategia con la claridad de un cuaderno y la potencia de un sistema empresarial escalable.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-5">
                   <Link href="/login?mode=signup" className="w-full sm:w-auto">
                      <Button className="w-full sm:w-auto px-10 py-8 text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/20">
                        Digitaliza tu empresa
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                   </Link>
                   <Link href="/demo">
                      <Button variant="ghost" className="text-lg font-bold px-8 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl">
                        Ver demo interactiva
                      </Button>
                   </Link>
                </div>
             </div>
          </div>
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent -z-10" />
        </section>

        {/* Quantia-style Solutions Section */}
        <section id="soluciones" className="py-32 bg-white dark:bg-slate-950">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-4 mb-16">
                 <div className="h-[2px] w-12 bg-primary" />
                 <span className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Soluciones Digitales</span>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                 {/* Left: Category List */}
                 <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-12 max-w-md font-heading dark:text-white">
                       Procesos inteligentes para empresas modernas
                    </h2>
                    
                    <div className="space-y-4">
                       {features.map((feature) => (
                          <button
                            key={feature.id}
                            onMouseEnter={() => setActiveFeature(feature)}
                            className={`w-full flex items-center justify-between p-7 rounded-[2rem] transition-all duration-300 text-left border ${
                              activeFeature.id === feature.id 
                                ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none translate-x-4" 
                                : "bg-transparent border-transparent text-slate-400 dark:text-slate-600 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 hover:translate-x-2"
                            }`}
                          >
                             <div className="flex items-center gap-6">
                                <div className={`h-12 w-12 rounded-2xl ${feature.accent} flex items-center justify-center text-white shrink-0 shadow-lg shadow-current/10`}>
                                   <feature.icon className="h-5 w-5 stroke-[1.5]" />
                                </div>
                                <span className={`text-xl font-bold ${activeFeature.id === feature.id ? "text-slate-900 dark:text-white" : ""}`}>
                                   {feature.title}
                                </span>
                             </div>
                             <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                                activeFeature.id === feature.id ? "bg-primary text-white scale-110" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                             }`}>
                                <ChevronRight className="h-5 w-5" />
                             </div>
                          </button>
                       ))}
                    </div>
                 </div>

                 {/* Right: Detail Display Area */}
                 <div className="lg:sticky lg:top-32 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-[3rem] p-12 min-h-[550px] flex flex-col justify-between overflow-hidden relative group transition-colors duration-300">
                    <div className="relative z-10 animate-fade-in-up" key={activeFeature.id}>
                       <div className="flex items-center gap-3 mb-6">
                          <Monitor className="h-4 w-4 text-indigo-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Módulo Corporativo</span>
                       </div>
                       <h3 className="text-4xl font-black mb-6 tracking-tighter font-heading dark:text-white">{activeFeature.title}</h3>
                       <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed mb-10 max-w-sm">
                          {activeFeature.desc}
                       </p>
                       <Link href="/login?mode=signup">
                          <Button className="font-bold text-xs uppercase tracking-widest px-8 h-12 rounded-xl">
                            Digitalizar ahora
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                       </Link>
                    </div>

                    <div className="mt-12 relative h-72 w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl transition-all group-hover:scale-[1.02] duration-500">
                       <img 
                         src={activeFeature.image} 
                         alt={activeFeature.title} 
                         className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                         key={activeFeature.image}
                       />
                       <div className="absolute inset-0 bg-indigo-900/5 dark:bg-indigo-900/20 pointer-events-none" />
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Final Call to Action */}
        <section className="py-40 bg-white dark:bg-slate-950">
           <div className="max-w-4xl mx-auto text-center px-4">
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 font-heading dark:text-white">¿Listo para el cambio?</h2>
              <p className="text-xl text-slate-500 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                 Unete a los departamentos de marketing que ya han dado el paso hacia la organización estructural digital.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                 <Link href="/login?mode=signup">
                    <Button className="h-16 px-12 text-lg font-bold rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-2xl shadow-slate-200 dark:shadow-none">
                       Reservar mi Agenda Digital
                    </Button>
                 </Link>
              </div>
           </div>
        </section>
      </main>

      <footer className="py-24 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col md:flex-row justify-between items-center gap-12">
              <div className="flex items-center gap-3">
                 <img src="/logo.png" alt="mkt.notes" className="h-9 w-auto grayscale opacity-50 dark:invert" />
                 <span className="text-xl font-black tracking-tighter dark:text-white">mkt.notes</span>
              </div>
              <div className="flex gap-12 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                 <a href="#" className="hover:text-primary transition-colors">Términos</a>
                 <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
                 <a href="#" className="hover:text-primary transition-colors">Contacto</a>
              </div>
           </div>
           <div className="mt-20 pt-12 border-t border-slate-200 dark:border-slate-800 flex flex-col items-center gap-8">
              <DeveloperSignature />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2026 mkt.notes. Digital Transformation.</p>
           </div>
        </div>
      </footer>
    </div>
  );
}
