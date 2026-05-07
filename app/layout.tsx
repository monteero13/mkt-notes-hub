import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import localFont from "next/font/local";
import { Suspense } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import QueryProvider from "@/components/QueryProvider";
import { WorkspaceProvider } from "@/components/layout/workspace-provider";
import { Toaster } from "sonner";

const clashGrotesk = localFont({
  src: "../public/fonts/ClashGrotesk-Bold.otf",
  variable: "--font-clash",
  weight: "700",
});

const satoshi = localFont({
  src: "../public/fonts/Satoshi-Medium.otf",
  variable: "--font-satoshi",
  weight: "500",
});

const switzer = localFont({
  src: "../public/fonts/Switzer-Black.otf",
  variable: "--font-switzer",
  weight: "900",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://mktnotes.com"
  ),
  title: {
    default: "MKT.NOTES — Marketing OS for Agencies & Teams",
    template: "%s | MKT.NOTES",
  },
  description:
    "The all-in-one operating system for marketing agencies. Manage clients, campaigns, content calendars, tasks, analytics and your entire team — in one beautiful platform.",
  keywords: [
    "marketing agency software",
    "content calendar",
    "campaign management",
    "marketing CRM",
    "social media planning",
    "marketing analytics",
  ],
  authors: [{ name: "MKT.NOTES" }],
  creator: "MKT.NOTES",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mktnotes.com",
    title: "MKT.NOTES — Marketing OS for Agencies & Teams",
    description:
      "The all-in-one platform for marketing agencies. Clients, campaigns, content, tasks and analytics — unified.",
    siteName: "MKT.NOTES",
  },
  twitter: {
    card: "summary_large_image",
    title: "MKT.NOTES — Marketing OS",
    description: "All-in-one platform for marketing agencies and teams.",
    creator: "@mktnotes",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#171721",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${clashGrotesk.variable} ${satoshi.variable} ${switzer.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <QueryProvider>
            <WorkspaceProvider>
              {children}
              <Toaster richColors closeButton position="bottom-right" />
            </WorkspaceProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
