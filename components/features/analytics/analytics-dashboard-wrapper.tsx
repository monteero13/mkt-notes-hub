"use client";

import dynamic from "next/dynamic";
import { AnalyticsDashboardProps } from "./analytics-dashboard";

const AnalyticsDashboard = dynamic(
  () => import("./analytics-dashboard").then(mod => mod.AnalyticsDashboard),
  { 
    ssr: false, 
    loading: () => <div className="h-[400px] w-full animate-pulse bg-accent/5 rounded-sm flex items-center justify-center technical-label text-[10px] uppercase opacity-40">Ingiriendo Datos Neurales...</div> 
  }
);

export function AnalyticsDashboardWrapper(props: AnalyticsDashboardProps) {
  return <AnalyticsDashboard {...props} />;
}
