import { useState, useEffect, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
// Avoid static import to allow proper lazy loading of the Joyride component
const STATUS = {
  FINISHED: 'finished',
  SKIPPED: 'skipped',
};

const Joyride: any = lazy(() =>
  import('react-joyride').then((mod) => ({
    default: mod.Joyride,
  }))
);

export function OnboardingTutorial() {
  const { t } = useTranslation();
  const [run, setRun] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // ✅ evita SSR
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Check initial theme
    setIsDarkMode(document.documentElement.classList.contains('dark'));

    // Observe theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    const hasSeenTutorial = localStorage.getItem('mkt_notes_tutorial_completed');
    if (!hasSeenTutorial) {
      setRun(true);
    }

    return () => observer.disconnect();
  }, []);

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(status)) {
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

  if (!isMounted) return null;

  return (
    <Suspense fallback={null}>
      <Joyride
        callback={handleJoyrideCallback}
        continuous
        hideCloseButton
        run={run}
        scrollToFirstStep
        showProgress
        showSkipButton
        disableBeacons
        disableOverlayClose
        steps={steps}
        locale={{
          last: t('tutorial.last'),
          skip: t('tutorial.skip'),
          next: t('tutorial.next'),
          back: t('tutorial.back'),
        }}
        styles={{
          options: {
            arrowColor: isDarkMode ? 'rgba(30, 41, 59, 1)' : 'rgba(255, 255, 255, 1)',
            backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 1)' : 'rgba(255, 255, 255, 1)',
            overlayColor: isDarkMode ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.7)',
            primaryColor: 'var(--primary)',
            textColor: isDarkMode ? 'rgba(255, 255, 255, 1)' : 'var(--foreground)',
            zIndex: 1000,
          },
          tooltip: {
            borderRadius: '24px',
            backdropFilter: 'blur(20px) saturate(180%)',
            backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.98)' : 'rgba(255, 255, 255, 0.98)',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            padding: '40px', // Aumentado para que la X no se salga
          },
          tooltipContainer: {
            textAlign: 'left',
          },
          tooltipTitle: {
            fontFamily: 'var(--font-heading)',
            fontSize: '22px',
            fontWeight: 800,
            marginBottom: '16px',
            color: 'var(--primary)',
            letterSpacing: '-0.02em',
          },
          tooltipContent: {
            fontFamily: 'var(--font-body)',
            padding: '0',
            fontSize: '15px',
            lineHeight: 1.7,
            color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'var(--foreground)',
            opacity: 0.8,
          },
          buttonNext: {
            backgroundColor: 'var(--primary)',
            borderRadius: '14px',
            color: '#fff',
            fontSize: '15px',
            fontWeight: 700,
            padding: '12px 24px',
            fontFamily: 'var(--font-heading)',
            boxShadow: '0 10px 15px -3px rgba(94, 129, 244, 0.4)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          buttonBack: {
            color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'var(--muted-foreground)',
            marginRight: '16px',
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'var(--font-heading)',
          },
          buttonSkip: {
            color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'var(--muted-foreground)',
            fontSize: '13px',
            fontWeight: 500,
            fontFamily: 'var(--font-heading)',
          },
          buttonClose: {
            top: '16px',
            right: '16px',
            color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)',
            transition: 'all 0.2s',
          },
          spotlight: {
            borderRadius: '20px',
            boxShadow: isDarkMode 
              ? '0 0 0 9999px rgba(0, 0, 0, 0.85), 0 0 40px var(--primary)' 
              : '0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 25px var(--primary)',
          },
        }}
      />
    </Suspense>
  );
}