'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  Users, 
  Target, 
  BarChart3, 
  CheckCircle2, 
  Star,
  Layers,
  Zap
} from "lucide-react";
import { DeveloperSignature } from "@/components/DeveloperSignature";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="mkt.notes" className="h-8 w-8 object-contain mix-blend-multiply dark:mix-blend-normal dark:invert" />
            <span className="font-heading text-xl font-bold tracking-tight">mkt.notes</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">Características</a>
            <a href="#demo" className="hover:text-primary transition-colors">Demo</a>
            <Link href="/pricing" className="hover:text-primary transition-colors">Precios</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-bold">Entrar</Button>
            </Link>
            <Link href="/login">
              <Button className="font-bold shadow-lg shadow-primary/20">Probar Gratis</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/20 text-primary text-xs font-bold mb-8 animate-fade-in">
              <Sparkles className="h-3 w-3" />
              <span>NUEVA VERSIÓN 2.0 DISPONIBLE</span>
            </div>
            <h1 className="font-heading text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
              Tu cerebro de marketing en una agenda física, <br className="hidden md:block" />
              <span className="text-primary italic">pero con superpoderes digitales.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed font-body">
              La herramienta definitiva para profesionales del marketing que aman la claridad de un cuaderno pero necesitan la potencia de la nube. Planifica, crea y colabora en un entorno premium.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full h-14 px-8 text-lg font-bold shadow-2xl shadow-primary/30 transition-all hover:scale-105">
                  Empezar ahora — Es gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg font-bold backdrop-blur-sm bg-background/50">
                Ver demo interactiva
              </Button>
            </div>

            {/* Mockup Preview */}
            <div className="mt-20 relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
              <div className="relative rounded-3xl border border-border/50 bg-card/30 backdrop-blur-md p-4 shadow-[0_0_50px_rgba(0,0,0,0.1)] transition-all group-hover:shadow-[0_0_80px_rgba(94,129,244,0.15)] overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                <img 
                  src="/dashboard_preview_1776246683183.png" 
                  alt="App Preview" 
                  className="rounded-2xl border border-border/40 shadow-2xl transition-transform duration-700 group-hover:scale-[1.01]"
                />
              </div>
              
              {/* Floating badges */}
              <div className="absolute -top-6 -right-6 md:right-12 bg-card border border-border/50 p-4 rounded-2xl shadow-xl animate-float hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold">Campaña Q2</p>
                    <p className="text-[10px] text-muted-foreground">Completada con éxito</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl font-bold mb-4 italic">Diseñado para la excelencia</h2>
              <p className="text-muted-foreground">Cada detalle ha sido cuidado para que tu flujo de trabajo sea impecable.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  icon: BookOpen, 
                  title: "Agenda Interactiva", 
                  desc: "Una interfaz que se siente como papel pero funciona como software de élite. Organiza tus días con claridad absoluta." 
                },
                { 
                  icon: Users, 
                  title: "Colaboración Real", 
                  desc: "Invita a tu equipo y asigna tareas en un editor compartido. Sin fricciones, sin caos." 
                },
                { 
                  icon: Target, 
                  title: "Gestión de Objetivos", 
                  desc: "No pierdas de vista tus OKRs y KPIs. Todo visual, todo accionable en un solo lugar." 
                },
                { 
                  icon: BarChart3, 
                  title: "Analítica Visual", 
                  desc: "Gráficos limpios que te dicen exactamente cómo van tus campañas sin abrumarte con datos." 
                },
                { 
                  icon: Layers, 
                  title: "Biblioteca Creativa", 
                  desc: "Guarda tus activos, copys y referencias visuales en un cajón digital siempre ordenado." 
                },
                { 
                  icon: Zap, 
                  title: "IA Integrada", 
                  desc: "Usa nuestra inteligencia asistida para generar borradores de contenido y resúmenes de campaña." 
                }
              ].map((f, i) => (
                <div key={i} className="bg-card/50 backdrop-blur-sm border border-border/50 p-8 rounded-3xl transition-all hover:bg-card hover:shadow-xl hover:-translate-y-1">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading text-xl font-bold mb-3">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-10">Con la confianza de marketers en</p>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" className="h-6" alt="Google" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" className="h-6" alt="Meta" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" className="h-6" alt="Netflix" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b9/Slack_Technologies_Logo.svg" className="h-6" alt="Slack" />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-[3rem] bg-slate-950 p-12 overflow-hidden text-center text-white">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/30 via-transparent to-transparent" />
              <div className="relative z-10">
                <Star className="h-12 w-12 text-yellow-400 mx-auto mb-6 animate-pulse" />
                <h2 className="text-4xl md:text-5xl font-extrabold mb-6 font-heading">¿Listo para elevar tu marketing?</h2>
                <p className="text-primary-foreground/70 text-lg mb-10 max-w-xl mx-auto">
                  Únete a más de 2,000 profesionales que ya han transformado su organización digital con mkt.notes.
                </p>
                <Link href="/login">
                  <Button size="lg" className="h-14 px-10 text-lg font-bold bg-white text-black hover:bg-slate-200 shadow-2xl shadow-white/10">
                    Comenzar Gratis Hoy
                  </Button>
                </Link>
                <p className="mt-6 text-sm text-muted-foreground italic">No requiere tarjeta de crédito · Setup en 30 segundos</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="mkt.notes" className="h-6 w-6" />
            <span className="font-heading font-bold">mkt.notes</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 mkt.notes. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Términos</a>
            <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
            <a href="#" className="hover:text-primary transition-colors">Soporte</a>
          </div>
        </div>
        <div className="mt-8 flex justify-center">
          <DeveloperSignature />
        </div>
      </footer>
    </div>
  );
}
