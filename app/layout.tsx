import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "@/components/I18nProvider";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";

export const metadata: Metadata = {
  title: "mkt.notes — Agenda Digital para Marketing",
  description: "Agenda digital interactiva para profesionales del marketing. Planifica campañas, organiza contenido y colabora con tu equipo.",
  authors: [{ name: "mkt.notes" }],
  openGraph: {
    title: "mkt.notes — Agenda Digital para Marketing",
    description: "Planifica campañas, organiza contenido y colabora con tu equipo.",
    type: "website",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <I18nProvider>
          <OnboardingTutorial />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
