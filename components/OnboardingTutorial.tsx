'use client';

import { useState, useEffect, lazy, Suspense, type ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { usePathname } from 'next/navigation';

// Importamos solo lo necesario
import { STATUS } from 'react-joyride';

// Definimos la interfaz para evitar errores de red y de tipo en el callback
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

// ✅ Forzamos a ComponentType<any> para evitar el error "Property callback does not exist"
// provocado por la incompatibilidad entre los tipos de Joyride v3 y React 19 lazy.
const Joyride = lazy(() =>
  import('react-joyride').then((mod) => ({
    default: (mod as any).default || mod.Joyride,
  }))
) as ComponentType<any>;

export function OnboardingTutorial() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [run, setRun] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Solo corre en el dashboard
    if (pathname !== '/dashboard') {
      setRun(false);
      return;
    }

    const hasSeenTutorial = localStorage.getItem('mkt_notes_tutorial_completed');
    const isFirstLogin = new URLSearchParams(window.location.search).get('firstLogin') === 'true';

    if (!hasSeenTutorial || isFirstLogin) {
      const timer = setTimeout(() => setRun(true), 1500); 
      return () => clearTimeout(timer);
    }

    return () => observer.disconnect();
  }, [pathname]);

  const handleJoyrideCallback = (data: JoyrideCallbackData) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setRun(false);
      localStorage.setItem('mkt_notes_tutorial_completed', 'true');
    }
  };

  const steps: any[] = [
    {
      target: 'body',
      placement: 'center',
      disableBeacon: true,
      content: (
        <div className="text-left">
          <h3 className="text-2xl font-heading font-bold mb-4 text-primary tracking-tight">{t('tutorial.step1_title')}</h3>
          <p className="text-base font-body text-foreground/80 leading-relaxed">{t('tutorial.step1_content')}</p>
        </div>
      ),
    },
    {
      target: '.tour-item-dashboard',
      disableBeacon: true,
      content: (
        <div className="text-left font-body">
          <h3 className="text-xl font-heading font-bold mb-3 text-primary">{t('tutorial.step_dashboard_title')}</h3>
          <p className="text-sm text-foreground/80 leading-relaxed">{t('tutorial.step_dashboard_content')}</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '.tour-item-planificador',
      content: (
        <div className="text-left font-body">
          <h3 className="text-xl font-heading font-bold mb-3 text-primary">{t('tutorial.step_planificador_title')}</h3>
          <p className="text-sm text-foreground/80 leading-relaxed">{t('tutorial.step_planificador_content')}</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '.tour-item-contenido',
      disableBeacon: true,
      content: (
        <div className="text-left font-body">
          <h3 className="text-xl font-heading font-bold mb-3 text-primary">{t('tutorial.step_contenido_title')}</h3>
          <p className="text-sm text-foreground/80 leading-relaxed">{t('tutorial.step_contenido_content')}</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '.tour-item-campanas',
      disableBeacon: true,
      content: (
        <div className="text-left font-body">
          <h3 className="text-xl font-heading font-bold mb-3 text-primary">{t('tutorial.step_campanas_title')}</h3>
          <p className="text-sm text-foreground/80 leading-relaxed">{t('tutorial.step_campanas_content')}</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '.tour-item-objetivos',
      disableBeacon: true,
      content: (
        <div className="text-left font-body">
          <h3 className="text-xl font-heading font-bold mb-3 text-primary">{t('tutorial.step_objetivos_title')}</h3>
          <p className="text-sm text-foreground/80 leading-relaxed">{t('tutorial.step_objetivos_content')}</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '.tour-item-ideas',
      disableBeacon: true,
      content: (
        <div className="text-left font-body">
          <h3 className="text-xl font-heading font-bold mb-3 text-primary">{t('tutorial.step_ideas_title')}</h3>
          <p className="text-sm text-foreground/80 leading-relaxed">{t('tutorial.step_ideas_content')}</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '.tour-item-biblioteca',
      disableBeacon: true,
      content: (
        <div className="text-left font-body">
          <h3 className="text-xl font-heading font-bold mb-3 text-primary">{t('tutorial.step_biblioteca_title')}</h3>
          <p className="text-sm text-foreground/80 leading-relaxed">{t('tutorial.step_biblioteca_content')}</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '.tour-item-equipo',
      disableBeacon: true,
      content: (
        <div className="text-left font-body">
          <h3 className="text-xl font-heading font-bold mb-3 text-primary">{t('tutorial.step_equipo_title')}</h3>
          <p className="text-sm text-foreground/80 leading-relaxed">{t('tutorial.step_equipo_content')}</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '.tour-upgrade-card',
      disableBeacon: true,
      content: (
        <div className="text-left font-body">
          <h3 className="text-xl font-heading font-bold mb-3 text-primary">{t('tutorial.step3_title')}</h3>
          <p className="text-sm text-foreground/80 leading-relaxed">{t('tutorial.step3_content')}</p>
        </div>
      ),
      placement: 'right',
    }
  ];

  if (!isMounted || pathname !== '/dashboard') return null;

  return (
    <Suspense fallback={null}>
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
            last: t('tutorial.last') || 'Finalizar',
            skip: t('tutorial.skip') || 'Saltar',
            next: t('tutorial.next') || 'Siguiente',
            back: t('tutorial.back') || 'Atrás',
          },
          styles: {
            options: {
              arrowColor: isDarkMode ? '#1e293b' : '#fff',
              backgroundColor: isDarkMode ? '#1e293b' : '#fff',
              overlayColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.6)',
              primaryColor: 'var(--color-primary, #5e81f4)',
              textColor: isDarkMode ? '#f8fafc' : '#1e293b',
              zIndex: 10000,
            },
            tooltip: {
              borderRadius: '20px',
              backgroundColor: isDarkMode ? '#1e293b' : '#fff',
              padding: '25px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            },
            buttonClose: {
              top: '20px',    // Bajamos la X desde el borde superior
              right: '20px',  // La alejamos del borde derecho
              width: '12px',  // Ajuste de tamaño opcional
              color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)',
            },
            buttonNext: {
              backgroundColor: 'var(--color-primary)',
              borderRadius: '10px',
              padding: '10px 20px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
            },
            buttonBack: {
              marginRight: '12px',
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-muted-foreground)',
            },
            spotlight: {
              // Se maneja como SVG Path internamente, evitamos propiedades de box-model directas aquí
              stroke: 'var(--color-primary)',
            },
          } as any
        } as any)}
      />
    </Suspense>
  );
}