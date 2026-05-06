'use client'

import { Button } from "@/components/ui/button"
import { Lock, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

interface PremiumLimitModalProps {
  title: string;
  description: string;
  onClose: () => void;
}

export function PremiumLimitModal({ title, description, onClose }: PremiumLimitModalProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-background p-8 flex flex-col items-center text-center gap-7">
      {/* Subtle brand glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand/[0.06] via-transparent to-brand/[0.03] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />

      {/* Icon lockup */}
      <div className="relative z-10 mt-2">
        <div className="h-16 w-16 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center shadow-[0_0_32px_-8px_rgba(0,132,255,0.3)]">
          <Lock className="h-7 w-7 text-brand" />
        </div>
        <div className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-brand flex items-center justify-center shadow-lg">
          <Sparkles className="h-3 w-3 text-white fill-white/60" />
        </div>
      </div>

      {/* Copy */}
      <div className="relative z-10 space-y-3">
        <h3
          className="text-2xl font-light tracking-tight text-foreground leading-tight"
          style={{ fontFamily: "var(--font-clash), sans-serif" }}
        >
          {title}
        </h3>
        <p
          className="text-sm text-muted-foreground leading-relaxed max-w-[260px] mx-auto"
          style={{ fontFamily: "var(--font-switzer), sans-serif" }}
        >
          {description}
        </p>
      </div>

      {/* CTA */}
      <div className="relative z-10 w-full space-y-3 pb-1">
        <Link href="/billing" className="block w-full">
          <Button className="w-full h-12 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand/90 active:scale-[0.98] transition-all shadow-lg shadow-brand/20 group">
            Actualizar a Pro
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </Link>
        <button
          onClick={onClose}
          className="text-xs font-medium text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          Quizás más tarde
        </button>
      </div>
    </div>
  )
}
