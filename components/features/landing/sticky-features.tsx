"use client";

import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { BarChart3, Brain, Calendar, Layout, ListTodo, Users, FileText, FolderOpen, ArrowUpRight, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(ScrollTrigger);

const FEATURE_ICONS = [Users, Layout, Calendar, ListTodo, Brain, FileText, FolderOpen, BarChart3];

export function StickyFeatures() {
  const t = useTranslations("landing.features");
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const items = (t.raw("items") as Array<{ title: string; description: string }>).map((item, i) => ({
    icon: FEATURE_ICONS[i]!,
    title: item.title,
    description: item.description,
  }));

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const itemsCount = items.length;

      // Create a master ScrollTrigger for the whole features section
      // We use a height proportional to the number of items
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: `+=${itemsCount * 100}%`,
        pin: true,
        pinSpacing: true,
        onUpdate: (self) => {
          // Calculate which index is currently active based on progress
          const progress = self.progress;
          const index = Math.min(
            Math.floor(progress * itemsCount),
            itemsCount - 1
          );
          setActiveIndex(index);
        },
        snap: {
          snapTo: 1 / (itemsCount - 1),
          duration: 0.5,
          delay: 0.1,
          ease: "power2.inOut"
        }
      });
    },
    { scope: containerRef, dependencies: [items.length] }
  );

  return (
    <section 
      id="features" 
      ref={containerRef} 
      className="relative bg-background text-foreground overflow-hidden border-y border-border"
    >
      <div className="mx-auto max-w-[120rem] px-6 lg:px-12 h-screen flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-[0.4fr_1fr] gap-6 w-full h-[85vh]">
          
          {/* Left: Content Card */}
          <div className="bg-card rounded-2xl p-8 flex flex-col justify-between overflow-hidden relative border border-border shadow-sm">
            <div className="relative flex-1">
              {items.map((feature, i) => (
                <div
                  key={i}
                  className={cn(
                    "absolute inset-0 flex flex-col justify-center gap-8 transition-all duration-500",
                    activeIndex === i ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
                  )}
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="h-px w-8 bg-brand" />
                       <span className="technical-label text-brand text-[10px]">Operational Asset 0{i + 1}</span>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-black tracking-tight leading-[1.1] uppercase">
                      {feature.title.split(' ').map((word, idx) => (
                        <span key={idx} className={idx === feature.title.split(' ').length - 1 ? "text-brand" : ""}>
                          {word}{' '}
                        </span>
                      ))}
                    </h2>
                    <div className="h-px w-full bg-border" />
                    <p className="text-sm lg:text-base text-muted-foreground leading-relaxed max-w-sm font-bold uppercase tracking-tight">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button at bottom of card */}
            <div className="mt-8 pt-8 border-t border-border">
              <Button 
                asChild
                className="group flex items-center justify-center gap-2 w-full bg-brand !text-white py-6 rounded-sm font-black uppercase text-[10px] tracking-wider hover:opacity-90 transition-all duration-300 technical-label"
              >
                <Link href="/login?mode=signup">
                  <span>{t("cta_primary" as any) || "Get Started"}</span>
                  <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right: Visual Display */}
          <div className="bg-card rounded-2xl overflow-hidden relative border border-border shadow-2xl">
            {items.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "absolute inset-0 transition-all duration-700",
                  activeIndex === i ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
                )}
              >
                {/* Mockup Frame */}
                <div className="w-full h-full p-6 lg:p-12">
                   <div className="w-full h-full bg-background rounded-sm border border-border shadow-inner flex flex-col overflow-hidden">
                      <div className="h-10 border-b border-border bg-muted/20 flex items-center px-4 gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-border" />
                        <div className="w-2.5 h-2.5 rounded-full bg-border" />
                        <div className="w-2.5 h-2.5 rounded-full bg-border" />
                      </div>
                      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                         {/* Dynamic Background Gradient */}
                         <div className={cn(
                           "absolute inset-0 opacity-20 blur-[100px] transition-colors duration-1000",
                           i % 2 === 0 ? "bg-brand" : "bg-brand/40"
                         )} />
                         
                         {/* Icon/Visual Content */}
                         <div className="relative z-10 flex flex-col items-center gap-8">
                            <div className="p-8 rounded-sm bg-background border border-border backdrop-blur-sm">
                              {React.createElement(FEATURE_ICONS[i] || Zap, { size: 80, className: activeIndex === i ? "text-brand" : "text-muted-foreground/20" })}
                            </div>
                            <div className="flex flex-col items-center gap-2">
                               <div className="technical-label text-[10px] text-muted-foreground tracking-[0.2em]">Node {i + 1} Operational</div>
                               <div className="h-1.5 w-40 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-brand w-2/3 animate-pulse" />
                               </div>
                            </div>
                         </div>

                         {/* Floating decorative elements */}
                         <div className="absolute top-12 left-12 w-32 h-32 border border-border/40 rounded-full" />
                         <div className="absolute bottom-24 right-12 w-48 h-48 border border-border/40 rounded-full" />
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
