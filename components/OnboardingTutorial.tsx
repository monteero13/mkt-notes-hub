'use client';

import { useState, useEffect, lazy, memo, type ComponentType } from 'react';
import { usePathname } from 'next/navigation';
import { STATUS } from 'react-joyride';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';

import { useDashboardData } from '@/hooks/use-dashboard-data';

interface JoyrideCallbackData {
  action: string;
  controlled: boolean;
  index: number;
  lifecycle: string;
  size: number;
  status: string;
  step: any;
  type: string;
}

const Joyride = lazy(() =>
  import('react-joyride').then((mod) => ({
    default: (mod as any).default || mod.Joyride,
  }))
) as ComponentType<any>;

export const OnboardingTutorial = memo(function OnboardingTutorial() {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const { tasks, campaigns, isLoading } = useDashboardData();
  const [run, setRun] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setIsMounted(true);
    const checkTheme = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    if (pathname === '/dashboard' && user && !isLoading) {
      // Prioritize explicit markers
      const hasSeenTutorialLocal = localStorage.getItem('mkt_notes_tutorial_completed');
      const hasSeenTutorialProfile = profile && (profile as any).has_seen_tutorial;
      
      // Heuristic Checks: Does the user have data?
      const hasData = (tasks && tasks.length > 0) || (campaigns && campaigns.length > 0);
      
      // Heuristic Checks: Is account older than 12 hours?
      const isOldAccount = user.created_at ? (new Date().getTime() - new Date(user.created_at).getTime() > 12 * 60 * 60 * 1000) : false;

      if (hasSeenTutorialProfile || hasData || isOldAccount) {
        // Veteran user or already completed
        setRun(false);
        // Force save to local storage just in case
        if (!hasSeenTutorialLocal) localStorage.setItem('mkt_notes_tutorial_completed', 'true');
      } else if (!hasSeenTutorialLocal) {
        // True new user
        const timer = setTimeout(() => setRun(true), 1500);
        return () => clearTimeout(timer);
      }
    } else {
      setRun(false);
    }
    return () => observer.disconnect();
  }, [pathname, user, profile, tasks, campaigns, isLoading]);

  const handleJoyrideCallback = async (data: JoyrideCallbackData) => {
    const { status } = data;
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setRun(false);
      localStorage.setItem('mkt_notes_tutorial_completed', 'true');
      
      // Update profile in DB if possible
      if (user) {
        await supabase
          .from('profiles')
          .update({ has_seen_tutorial: true } as any)
          .eq('id', user.id);
      }
    }
  };

  const steps: any[] = [
    {
      target: 'body',
      placement: 'center',
      disableBeacon: true,
      content: (
        <div className="text-left">
          <h3 className="text-xl font-bold mb-2 text-primary tracking-tight">Bienvenido a mkt.notes</h3>
          <p className="text-sm text-foreground/80 leading-relaxed">Te vamos a dar un breve tour para que le saques el máximo partido a tu nueva herramienta.</p>
        </div>
      ),
    },
    {
      target: '.tour-item-dashboard',
      disableBeacon: true,
      content: (
        <div className="text-left">
          <h3 className="text-lg font-bold mb-2 text-primary">Dashboard</h3>
          <p className="text-xs text-foreground/80 leading-relaxed">Esta es tu pantalla principal. Aquí tendrás una visión general del rendimiento de tus estrategias, métricas y próximos pasos.</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '.tour-item-new-action',
      content: (
        <div className="text-left">
          <h3 className="text-lg font-bold mb-2 text-primary">Nuevo</h3>
          <p className="text-xs text-foreground/80 leading-relaxed">Crea rápidamente nuevas tareas o misiones tácticas desde cualquier lugar.</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '.tour-item-stats',
      content: (
        <div className="text-left">
          <h3 className="text-lg font-bold mb-2 text-primary">Métricas Clave</h3>
          <p className="text-xs text-foreground/80 leading-relaxed">De un vistazo, controla el alcance, posts y objetivos del mes.</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '.tour-item-campaigns-list',
      content: (
        <div className="text-left">
          <h3 className="text-lg font-bold mb-2 text-primary">Tus Campañas</h3>
          <p className="text-xs text-foreground/80 leading-relaxed">Aquí verás el progreso real de tus estrategias activas.</p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '.tour-item-priority-tasks',
      content: (
        <div className="text-left">
          <h3 className="text-lg font-bold mb-2 text-primary">Misiones Críticas</h3>
          <p className="text-xs text-foreground/80 leading-relaxed">Las tareas más urgentes aparecen aquí para que no se te pase nada.</p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '.tour-item-planificador',
      content: (
        <div className="text-left">
          <h3 className="text-lg font-bold mb-2 text-primary">Planificador</h3>
          <p className="text-xs text-foreground/80 leading-relaxed">Un calendario donde podrás agendar y organizar temporalmente todos tus lanzamientos y publicaciones pautadas.</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '.tour-item-contenido',
      content: (
        <div className="text-left">
          <h3 className="text-lg font-bold mb-2 text-primary">Contenido</h3>
          <p className="text-xs text-foreground/80 leading-relaxed">El centro de operaciones de tu contenido. Redacta, gestiona copys y mantén todo tu material aquí.</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '.tour-item-campanas',
      content: (
        <div className="text-left">
          <h3 className="text-lg font-bold mb-2 text-primary">Campañas</h3>
          <p className="text-xs text-foreground/80 leading-relaxed">Evalúa y controla tus campañas publicitarias, segmentaciones y retornos de inversión. (Característica Pro).</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '.tour-item-objetivos',
      content: (
        <div className="text-left">
          <h3 className="text-lg font-bold mb-2 text-primary">Objetivos</h3>
          <p className="text-xs text-foreground/80 leading-relaxed">Define metas claras (OKRs, KPIs) y haz un seguimiento periódico de tus logros estratégicos.</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '.tour-item-ideas',
      content: (
        <div className="text-left">
          <h3 className="text-lg font-bold mb-2 text-primary">Ideas</h3>
          <p className="text-xs text-foreground/80 leading-relaxed">¿Tienes un bloque creativo? Anota lluvias de ideas, braimstormings fugaces y no dejes escapar nada.</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '.tour-item-biblioteca',
      content: (
        <div className="text-left">
          <h3 className="text-lg font-bold mb-2 text-primary">Biblioteca</h3>
          <p className="text-xs text-foreground/80 leading-relaxed">Tu archivo de recursos, referencias, inspiración visual y guías de la marca.</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '.tour-item-equipo',
      content: (
        <div className="text-left">
          <h3 className="text-lg font-bold mb-2 text-primary">Equipo</h3>
          <p className="text-xs text-foreground/80 leading-relaxed">Gestiona permisos, invita colaboradores y coordina a todo tu departamento asíncronamente.</p>
        </div>
      ),
      placement: 'right',
    }
  ];

  if (!isMounted || pathname !== '/dashboard' || !run) return null;

  return (
    <Joyride
      {...({
        callback: handleJoyrideCallback,
        continuous: true,
        run: run,
        scrollToFirstStep: true,
        showProgress: true,
        showSkipButton: true,
        disableScrolling: false,
        disableScrollParentFix: true,
        steps: steps,
        locale: {
          last: 'Finalizar',
          skip: 'Saltar',
          next: 'Siguiente',
          back: 'Anterior',
        },
        styles: {
          options: {
            arrowColor: isDarkMode ? '#0f1115' : '#fff',
            backgroundColor: isDarkMode ? '#0f1115' : '#fff',
            overlayColor: isDarkMode ? 'rgba(0, 0, 0, 0.75)' : 'rgba(0, 0, 0, 0.5)',
            primaryColor: '#3b82f6',
            textColor: isDarkMode ? '#fff' : '#000',
            zIndex: 10000,
          },
          tooltip: {
            borderRadius: '16px',
            backgroundColor: isDarkMode ? '#0f1115' : '#fff',
            padding: '24px', // Increased padding
            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.3)',
            border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
            maxWidth: '350px',
          },
          buttonNext: {
            backgroundColor: '#3b82f6',
            borderRadius: '8px',
            padding: '8px 16px',
            fontWeight: 700,
            fontSize: '12px',
          },
          buttonBack: {
             marginRight: '12px',
             color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
             fontSize: '11px',
             fontWeight: 600,
          },
          buttonSkip: {
             color: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
             fontSize: '11px',
             fontWeight: 600,
             padding: '8px', // Better click area
          }
        } as any
      } as any)}
    />
  );
});