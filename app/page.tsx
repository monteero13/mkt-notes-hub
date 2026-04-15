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

const features = [
  {
    id: "org",
    title: "Organización Total",
    desc: "Reemplaza el caos de las agendas físicas por un sistema centralizado. Todo tu marketing en un solo lugar, accesible desde cualquier dispositivo.",
    icon: BookOpen,
    image: "/dashboard_preview_1776246683183.png",
    accent: "bg-blue-500"
  },
  {
    id: "collab",
    title: "Sincronización de Equipos",
    desc: "Coordina a tu equipo sin fricciones. Asigna tareas, comparte notas y mantén a todos alineados con los objetivos del trimestre.",
    icon: Users,
    image: "/dashboard_preview_1776246683183.png",
    accent: "bg-purple-500"
  },
  {
    id: "analytics",
    title: "Análisis de Impacto",
    desc: "Lo que no se mide no se mejora. Obtén informes visuales instantáneos sobre el progreso de tus campañas y el rendimiento del equipo.",
    icon: BarChart3,
    image: "/dashboard_preview_1776246683183.png",
    accent: "bg-indigo-500"
  },
  {
    id: "security",
    title: "Seguridad y Nube",
    desc: "Tus datos están protegidos con cifrado de grado empresarial. Copias de seguridad automáticas para que nunca pierdas una sola idea.",
    icon: ShieldCheck,
    image: "/dashboard_preview_1776246683183.png",
    accent: "bg-slate-800"
  }
];

export default function LandingPage() {
  const [user, setUser] = useState<any>(null);
  const [isPro, setIsPro] = useState(false);
  const [activeFeature, setActiveFeature] = useState(features[0]);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_pro')
          .eq('id', user.id)
          .single();
        setIsPro(!!profile?.is_pro);
      }
    };
    checkUser();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-primary/20 font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-slate-100 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <LayoutDashboard className="h-6 w-6" />
             </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 font-heading">mkt.notes</span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-[13px] font-bold uppercase tracking-widest text-slate-500">
            <a href="#soluciones" className="hover:text-primary transition-colors">Soluciones</a>
            <Link href="/demo" className="hover:text-primary transition-colors">Demo</Link>
            <Link href="/pricing" className="hover:text-primary transition-colors">Planes</Link>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
               <Link href="/dashboard">
                  <Button className="font-bold px-6 py-6 rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                    Dashboard
                  </Button>
               </Link>
            ) : (
              <>
                <Link href="/login?mode=login" className="text-sm font-bold text-slate-600 hover:text-primary px-4 transition-colors">
                  Login
                </Link>
                <Link href="/login?mode=signup&plan=pro">
                  <Button className="font-bold px-6 py-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-200 transition-all">
                    Comenzar ahora
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main>
        {/* Modern Hero */}
        <section className="relative pt-40 pb-24 overflow-hidden bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="max-w-4xl">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                  Transformación Digital 2026
                </span>
                <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] text-slate-950 mb-8 font-heading">
                  El salto de la agenda física a la <span className="text-primary">inteligencia digital.</span>
                </h1>
                <p className="text-xl md:text-2xl text-slate-500 max-w-2xl leading-relaxed mb-12">
                   Organiza tu estrategia de marketing con la claridad de un cuaderno y la potencia de un sistema empresarial escalable.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-5">
                   <Link href="/login?mode=signup" className="w-full sm:w-auto">
                      <Button className="w-full sm:w-auto px-10 py-8 text-lg font-bold rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 shadow-2xl shadow-indigo-200">
                        Digitaliza tu empresa
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                   </Link>
                   <Link href="/demo">
                      <Button variant="ghost" className="text-lg font-bold px-8 hover:bg-slate-100 rounded-[2rem]">
                        Ver demo interactiva
                      </Button>
                   </Link>
                </div>
             </div>
          </div>
          
          {/* Subtle Background Elements */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent -z-10" />
        </section>

        {/* Quantia-style Solutions Section */}
        <section id="soluciones" className="py-32">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-4 mb-16">
                 <div className="h-[2px] w-12 bg-primary" />
                 <span className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Soluciones Digitales</span>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                 {/* Left: Category List */}
                 <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-12 max-w-md font-heading">
                       Soluciones a medida para transformar procesos
                    </h2>
                    
                    <div className="space-y-3">
                       {features.map((feature) => (
                          <button
                            key={feature.id}
                            onMouseEnter={() => setActiveFeature(feature)}
                            className={`w-full flex items-center justify-between p-6 rounded-[2rem] transition-all duration-300 text-left border ${
                              activeFeature.id === feature.id 
                                ? "bg-white border-slate-200 shadow-2xl shadow-slate-100 translate-x-4" 
                                : "bg-transparent border-transparent text-slate-400 opacity-60 grayscale hover:opacity-100 hover:grayscale-0"
                            }`}
                          >
                             <div className="flex items-center gap-6">
                                <div className={`h-12 w-12 rounded-2xl ${feature.accent} flex items-center justify-center text-white shrink-0`}>
                                   <feature.icon className="h-6 w-6" />
                                </div>
                                <span className={`text-xl font-bold ${activeFeature.id === feature.id ? "text-slate-900" : ""}`}>
                                   {feature.title}
                                </span>
                             </div>
                             <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                                activeFeature.id === feature.id ? "bg-primary text-white scale-110" : "bg-slate-100 text-slate-400"
                             }`}>
                                <ChevronRight className="h-5 w-5" />
                             </div>
                          </button>
                       ))}
                    </div>
                 </div>

                 {/* Right: Detail Display Area */}
                 <div className="lg:sticky lg:top-32 bg-slate-50 border border-slate-100 rounded-[3rem] p-12 min-h-[500px] flex flex-col justify-between overflow-hidden relative group">
                    <div className="relative z-10 animate-fade-in-up" key={activeFeature.id}>
                       <div className="flex items-center gap-3 mb-6">
                          <Monitor className="h-5 w-5 text-indigo-500" />
                          <span className="text-xs font-black uppercase tracking-widest text-indigo-500">Módulo Integrado</span>
                       </div>
                       <h3 className="text-3xl font-black mb-6 tracking-tighter font-heading">{activeFeature.title}</h3>
                       <p className="text-slate-500 text-lg leading-relaxed mb-10 max-w-sm">
                          {activeFeature.desc}
                       </p>
                       <Link href="/login?mode=signup">
                          <Button className="font-bold text-xs uppercase tracking-widest px-8">
                            Conoce más
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                       </Link>
                    </div>

                    <div className="mt-12 relative h-64 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-2xl transition-all group-hover:scale-[1.03]">
                       <img 
                         src={activeFeature.image} 
                         alt={activeFeature.title} 
                         className="absolute inset-0 w-full h-full object-cover"
                       />
                       <div className="absolute inset-0 bg-indigo-900/10 pointer-events-none" />
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Final Call to Action */}
        <section className="py-40">
           <div className="max-w-4xl mx-auto text-center px-4">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 font-heading">¿Listo para el cambio?</h2>
              <p className="text-xl text-slate-500 mb-12">
                 Únete a más de 2,000 agencias y departamentos de marketing que ya han dado el paso hacia la organización digital.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                 <Link href="/login?mode=signup">
                    <Button className="h-16 px-12 text-lg font-bold rounded-2xl bg-slate-900 hover:bg-slate-800 shadow-2xl shadow-slate-200">
                       Reservar mi Agenda Digital
                    </Button>
                 </Link>
              </div>
           </div>
        </section>
      </main>

      <footer className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="flex items-center gap-3">
                 <img src="/logo.png" alt="mkt.notes" className="h-8 w-auto grayscale" />
                 <span className="text-xl font-black tracking-tighter">mkt.notes</span>
              </div>
              <div className="flex gap-10 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                 <a href="#" className="hover:text-primary">Términos</a>
                 <a href="#" className="hover:text-primary">Privacidad</a>
                 <a href="#" className="hover:text-primary">Contacto</a>
              </div>
           </div>
           <div className="mt-20 pt-10 border-t border-slate-200 flex flex-col items-center gap-6 text-slate-400">
              <DeveloperSignature />
              <p className="text-xs">© 2026 mkt.notes. Orgullosamente digital.</p>
           </div>
        </div>
      </footer>
    </div>
  );
}
