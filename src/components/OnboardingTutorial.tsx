import { useState, useEffect, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import type { Step } from 'react-joyride';
import { STATUS } from 'react-joyride';

const Joyride: any = lazy(() =>
  import('react-joyride').then((mod) => ({
    default: mod.Joyride,
  }))
);

export function OnboardingTutorial() {
  const { t } = useTranslation();
  const [run, setRun] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // ✅ evita SSR

  useEffect(() => {
    setIsMounted(true);
    const hasSeenTutorial = localStorage.getItem('mkt_notes_tutorial_completed');
    if (!hasSeenTutorial) {
      setRun(true);
    }
  }, []);

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('mkt_notes_tutorial_completed', 'true');
    }
  };

  const steps: Step[] = [
    {
      target: 'body',
      placement: 'center',
      content: (
        <div className="text-left font-sans">
          <h3 className="text-lg font-bold mb-2">{t('tutorial.step1_title')}</h3>
          <p className="text-sm text-muted-foreground">{t('tutorial.step1_content')}</p>
        </div>
      ),
    },
    {
      target: '.tour-item-dashboard',
      content: (
        <div className="text-left font-sans">
          <h3 className="text-lg font-bold mb-2">{t('tutorial.step_dashboard_title')}</h3>
          <p className="text-sm text-muted-foreground">{t('tutorial.step_dashboard_content')}</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '.tour-item-planificador',
      content: (
        <div className="text-left font-sans">
          <h3 className="text-lg font-bold mb-2">{t('tutorial.step_planificador_title')}</h3>
          <p className="text-sm text-muted-foreground">{t('tutorial.step_planificador_content')}</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '.tour-item-contenido',
      content: (
        <div className="text-left font-sans">
          <h3 className="text-lg font-bold mb-2">{t('tutorial.step_contenido_title')}</h3>
          <p className="text-sm text-muted-foreground">{t('tutorial.step_contenido_content')}</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '.tour-item-campanas',
      content: (
        <div className="text-left font-sans">
          <h3 className="text-lg font-bold mb-2">{t('tutorial.step_campanas_title')}</h3>
          <p className="text-sm text-muted-foreground">{t('tutorial.step_campanas_content')}</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '.tour-item-objetivos',
      content: (
        <div className="text-left font-sans">
          <h3 className="text-lg font-bold mb-2">{t('tutorial.step_objetivos_title')}</h3>
          <p className="text-sm text-muted-foreground">{t('tutorial.step_objetivos_content')}</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '.tour-item-ideas',
      content: (
        <div className="text-left font-sans">
          <h3 className="text-lg font-bold mb-2">{t('tutorial.step_ideas_title')}</h3>
          <p className="text-sm text-muted-foreground">{t('tutorial.step_ideas_content')}</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '.tour-item-biblioteca',
      content: (
        <div className="text-left font-sans">
          <h3 className="text-lg font-bold mb-2">{t('tutorial.step_biblioteca_title')}</h3>
          <p className="text-sm text-muted-foreground">{t('tutorial.step_biblioteca_content')}</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '.tour-item-equipo',
      content: (
        <div className="text-left font-sans">
          <h3 className="text-lg font-bold mb-2">{t('tutorial.step_equipo_title')}</h3>
          <p className="text-sm text-muted-foreground">{t('tutorial.step_equipo_content')}</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '.tour-upgrade-card',
      content: (
        <div className="text-left font-sans">
          <h3 className="text-lg font-bold mb-2">{t('tutorial.step3_title')}</h3>
          <p className="text-sm text-muted-foreground">{t('tutorial.step3_content')}</p>
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
        steps={steps}
        locale={{
          last: t('tutorial.last'),
          skip: t('tutorial.skip'),
          next: t('tutorial.next'),
          back: t('tutorial.back'),
        }}
        styles={{
          options: {
            arrowColor: 'rgba(255, 255, 255, 0.8)',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            overlayColor: 'rgba(0, 0, 0, 0.4)',
            primaryColor: 'oklch(0.588 0.158 252)',
            textColor: 'oklch(0.15 0.02 260)',
            zIndex: 1000,
          },
          tooltip: {
            borderRadius: '20px',
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            padding: '24px',
            fontFamily: '"Manrope", sans-serif',
          },
          tooltipContainer: {
            textAlign: 'left',
          },
          tooltipTitle: {
            fontFamily: '"Sora", sans-serif',
            fontSize: '18px',
            fontWeight: 700,
            marginBottom: '12px',
            color: 'oklch(0.588 0.158 252)',
          },
          tooltipContent: {
            padding: '0',
            fontSize: '14px',
            lineHeight: 1.6,
            color: 'oklch(0.15 0.02 260)',
            opacity: 0.9,
          },
          buttonNext: {
            backgroundColor: 'oklch(0.588 0.158 252)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 700,
            padding: '10px 20px',
            fontFamily: '"Sora", sans-serif',
            boxShadow: '0 4px 12px rgba(94, 129, 244, 0.3)',
            transition: 'all 0.2s ease',
          },
          buttonBack: {
            color: 'oklch(0.55 0.03 255)',
            marginRight: '12px',
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: '"Sora", sans-serif',
          },
          buttonSkip: {
            color: 'oklch(0.55 0.03 255)',
            fontSize: '13px',
            fontWeight: 500,
            fontFamily: '"Sora", sans-serif',
          },
          spotlight: {
            borderRadius: '16px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4), 0 0 15px rgba(94, 129, 244, 0.4)',
          },
        }}
      />
    </Suspense>
  );
}