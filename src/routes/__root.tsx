import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n/config";
import { OnboardingTutorial } from "../components/OnboardingTutorial";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-heading text-7xl font-bold text-foreground">
          {t('common.not_found_title')}
        </h1>
        <h2 className="mt-4 font-heading text-xl font-semibold text-foreground">
          {t('common.not_found_subtitle')}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('common.not_found_desc')}
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t('common.back_to_home')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "mkt.notes — Agenda Digital para Marketing" },
      { name: "description", content: "Agenda digital interactiva para profesionales del marketing. Planifica campañas, organiza contenido y colabora con tu equipo." },
      { name: "author", content: "mkt.notes" },
      { property: "og:title", content: "mkt.notes — Agenda Digital para Marketing" },
      { property: "og:description", content: "Planifica campañas, organiza contenido y colabora con tu equipo." },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/logo.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <I18nextProvider i18n={i18n}>
      <OnboardingTutorial />
      <Outlet />
    </I18nextProvider>
  );
}
