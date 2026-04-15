'use client';

import { useState } from 'react'
import { Check, Sparkles, Zap, Shield, Crown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { createCheckoutSession } from '@/lib/stripe'
import { toast } from 'sonner'

export default function PricingPage() {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const priceId = process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID;
      if (!priceId) {
        throw new Error('Stripe Price ID is not configured');
      }
      // Note: createCheckoutSession will redirect on success
      await createCheckoutSession(priceId);
    } catch (error: any) {
      // If redirect happens, this might still catch but Next.js handle redirects by throwing a special error
      if (error.message !== 'NEXT_REDIRECT') {
        toast.error(error.message || 'Error al procesar el pago');
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background py-20 px-4">
      <div className="mx-auto max-w-5xl text-center mb-16">
        <Badge variant="secondary" className="mb-4 px-4 py-1.5 bg-primary/10 text-primary border-none font-bold uppercase tracking-widest text-[10px]">
          {t('pricing.badge')}
        </Badge>
        <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
          {i18n.language === 'es' ? (
            <>Lleva tu marketing al <span className="text-primary tracking-tighter italic">siguiente nivel</span></>
          ) : (
            <>Take your marketing to the <span className="text-primary tracking-tighter italic">next level</span></>
          )}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('pricing.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <Card className="relative border-border bg-card/50 backdrop-blur-sm transition-all hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-xl">{t('pricing.free_plan')}</CardTitle>
            </div>
            <CardDescription>{t('pricing.free_desc')}</CardDescription>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight">0€</span>
              <span className="text-sm font-medium text-muted-foreground">{t('pricing.free_price_suffix')}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <FeatureItem text={t('pricing.features.active_campaigns')} />
            <FeatureItem text={t('pricing.features.basic_library')} />
            <FeatureItem text={t('pricing.features.monthly_planner')} />
            <FeatureItem text={t('pricing.features.one_device')} />
          </CardContent>
          <CardFooter>
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full h-11 font-bold">
                {t('pricing.keep_free')}
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className="relative border-primary bg-card shadow-2xl shadow-primary/10 transition-all hover:scale-[1.02] overflow-hidden">
          <div className="absolute top-0 right-0">
            <div className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest py-1 px-10 rotate-45 translate-x-[30%] translate-y-[50%] shadow-lg">
              {t('pricing.recommended')}
            </div>
          </div>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">{t('pricing.pro_plan')}</CardTitle>
            </div>
            <CardDescription>{t('pricing.pro_desc')}</CardDescription>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight">5€</span>
              <span className="text-sm font-medium text-muted-foreground">{t('pricing.pro_price_suffix')}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <FeatureItem text={t('pricing.features.unlimited_campaigns')} isPro />
            <FeatureItem text={t('pricing.features.advanced_analytics')} isPro />
            <FeatureItem text={t('pricing.features.full_library')} isPro />
            <FeatureItem text={t('pricing.features.team_collaboration')} isPro />
            <FeatureItem text={t('pricing.features.priority_support')} isPro />
            <FeatureItem text={t('pricing.features.multi_device')} isPro />
          </CardContent>
          <CardFooter>
            <Button
              className="w-full h-11 bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
              onClick={handleCheckout}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {t('pricing.get_pro')}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-20 text-center">
        <div className="inline-flex items-center gap-2 p-2 px-4 rounded-full bg-muted/50 border border-border text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>{t('pricing.secure_payment')}</span>
        </div>
      </div>
    </div>
  )
}

function FeatureItem({ text, isPro = false }: { text: string; isPro?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`mt-0.5 rounded-full p-0.5 ${isPro ? 'bg-primary/20' : 'bg-muted'}`}>
        <Check className={`h-3 w-3 ${isPro ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>
      <span className={`text-sm ${isPro ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
        {text}
      </span>
    </div>
  )
}

