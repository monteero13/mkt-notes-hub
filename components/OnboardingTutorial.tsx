'use client';

import { useState, useEffect, lazy, memo, type ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { usePathname, useSearchParams } from 'next/navigation';
import { STATUS } from 'react-joyride';

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
  const { t } = useTranslation();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [run, setRun] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const checkTheme = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    if (pathname === '/dashboard') {
      const hasSeenTutorial = localStorage.getItem('mkt_notes_tutorial_completed');
      const isFirstLogin = searchParams?.get('firstLogin') === 'true';
      
      // Solo correr si NO ha visto el tutorial Y es explícitamente el primer login (vía URL param)
      if (!hasSeenTutorial && isFirstLogin) {
        const timer = setTimeout(() => setRun(true), 1500);
        return () => clearTimeout(timer);
      } else {
        // Si no es el primer login o ya lo vio, marcamos como completado para evitar que salga en el futuro
        if (!hasSeenTutorial) {
            localStorage.setItem('mkt_notes_tutorial_completed', 'true');
        }
        setRun(false);
      }
    } else {
      setRun(false);
    }
    return () => observer.disconnect();
  }, [pathname, searchParams]);

  const handleJoyrideCallback = (data: JoyrideCallbackData) => {
    const { status } = data;
    
    // Explicitly handle finished and skipped statuses
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setRun(false);
      localStorage.setItem('mkt_notes_tutorial_completed', 'true');
      
      // Clean up URL to remove firstLogin parameter
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (url.searchParams.has('firstLogin')) {
          url.searchParams.delete('firstLogin');
          window.history.replaceState({}, '', url.toString());
        }
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
          <h3 className="text-xl font-bold mb-2 text-primary tracking-tight">{t('tutorial.step1_title')}</h3>
          <p className="text-sm text-foreground/80 leading-relaxed">{t('tutorial.step1_content')}</p>
        </div>
      ),
    },
    {
      target: '.tour-item-dashboard',
      disableBeacon: true,
      content: (
        <div className="text-left">
          <h3 className="text-lg font-bold mb-2 text-primary">{t('sidebar.dashboard')}</h3>
          <p className="text-xs text-foreground/80 leading-relaxed">{t('tutorial.step_dashboard_content')}</p>
        </div>
      ),
      placement: 'right',
    },
    {
        target: '.tour-item-new-action',
        content: (
          <div className="text-left">
            <h3 className="text-lg font-bold mb-2 text-primary">{t('common.new')}</h3>
            <p className="text-xs text-foreground/80 leading-relaxed">{t('tutorial.step_new_action_content', 'Crea rápidamente nuevas tareas o misiones tácticas desde cualquier lugar.')}</p>
          </div>
        ),
        placement: 'bottom',
    },
    {
        target: '.tour-item-stats',
        content: (
          <div className="text-left">
            <h3 className="text-lg font-bold mb-2 text-primary">{t('tutorial.step_stats_title')}</h3>
            <p className="text-xs text-foreground/80 leading-relaxed">{t('tutorial.step_stats_content')}</p>
          </div>
        ),
        placement: 'bottom',
    },
    {
        target: '.tour-item-campaigns-list',
        content: (
          <div className="text-left">
            <h3 className="text-lg font-bold mb-2 text-primary">{t('tutorial.step_campaigns_list_title')}</h3>
            <p className="text-xs text-foreground/80 leading-relaxed">{t('tutorial.step_campaigns_list_content')}</p>
          </div>
        ),
        placement: 'top',
    },
    {
        target: '.tour-item-priority-tasks',
        content: (
          <div className="text-left">
            <h3 className="text-lg font-bold mb-2 text-primary">{t('tutorial.step_priority_tasks_title')}</h3>
            <p className="text-xs text-foreground/80 leading-relaxed">{t('tutorial.step_priority_tasks_content')}</p>
          </div>
        ),
        placement: 'top',
    },
    {
      target: '.tour-item-planificador',
      content: (
        <div className="text-left">
          <h3 className="text-lg font-bold mb-2 text-primary">{t('sidebar.planificador')}</h3>
          <p className="text-xs text-foreground/80 leading-relaxed">{t('tutorial.step_planificador_content')}</p>
        </div>
      ),
      placement: 'right',
    },
    {
        target: '.tour-item-contenido',
        content: (
          <div className="text-left">
            <h3 className="text-lg font-bold mb-2 text-primary">{t('sidebar.contenido')}</h3>
            <p className="text-xs text-foreground/80 leading-relaxed">{t('tutorial.step_contenido_content')}</p>
          </div>
        ),
        placement: 'right',
    },
    {
        target: '.tour-item-campanas',
        content: (
          <div className="text-left">
            <h3 className="text-lg font-bold mb-2 text-primary">{t('sidebar.campanas')}</h3>
            <p className="text-xs text-foreground/80 leading-relaxed">{t('tutorial.step_campanas_content')}</p>
          </div>
        ),
        placement: 'right',
    },
    {
        target: '.tour-item-objetivos',
        content: (
          <div className="text-left">
            <h3 className="text-lg font-bold mb-2 text-primary">{t('sidebar.objetivos')}</h3>
            <p className="text-xs text-foreground/80 leading-relaxed">{t('tutorial.step_objetivos_content')}</p>
          </div>
        ),
        placement: 'right',
    },
    {
        target: '.tour-item-ideas',
        content: (
          <div className="text-left">
            <h3 className="text-lg font-bold mb-2 text-primary">{t('sidebar.ideas')}</h3>
            <p className="text-xs text-foreground/80 leading-relaxed">{t('tutorial.step_ideas_content')}</p>
          </div>
        ),
        placement: 'right',
    },
    {
        target: '.tour-item-biblioteca',
        content: (
          <div className="text-left">
            <h3 className="text-lg font-bold mb-2 text-primary">{t('sidebar.biblioteca')}</h3>
            <p className="text-xs text-foreground/80 leading-relaxed">{t('tutorial.step_biblioteca_content')}</p>
          </div>
        ),
        placement: 'right',
    },
    {
        target: '.tour-item-equipo',
        content: (
          <div className="text-left">
            <h3 className="text-lg font-bold mb-2 text-primary">{t('sidebar.equipo')}</h3>
            <p className="text-xs text-foreground/80 leading-relaxed">{t('tutorial.step_equipo_content')}</p>
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
          last: t('tutorial.last'),
          skip: t('tutorial.skip'),
          next: t('tutorial.next'),
          back: t('tutorial.back'),
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
            padding: '20px',
            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.3)',
            border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
            maxWidth: '350px',
          },
          buttonNext: {
            backgroundColor: '#3b82f6',
            borderRadius: '8px',
            padding: '8px 16px',
            fontWeight: 600,
            fontSize: '12px',
          },
          buttonBack: {
             marginRight: '8px',
             color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
             fontSize: '12px',
          },
          buttonSkip: {
             color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
             fontSize: '12px',
          }
        } as any
      } as any)}
    />
  );
});