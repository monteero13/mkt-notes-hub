'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, Camera, ShieldCheck, User, Mail, Lock, ChevronRight, Fingerprint, HelpCircle, Send } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardLayout } from '@/components/DashboardLayout'
import { useQueryClient } from '@tanstack/react-query'
import { useWorkspace } from '@/hooks/use-workspace'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

export default function PerfilPage() {
  const { user, profile, isLoading } = useAuth()
  const { isPro } = useWorkspace()
  const t = useTranslations('settings')
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale || 'es'

  const handleStartTour = () => {
    router.push(`/${locale}/dashboard`)
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("open-onboarding-tour"))
    }, 800)
  }

  const [isSaving, setIsSaving] = useState(false)
  const [fullName, setFullName] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)

  // Contact Form State
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [contactCategory, setContactCategory] = useState<'ayuda' | 'mejoras y correccion'>('ayuda')
  const [contactSubject, setContactSubject] = useState('')
  const [contactMessage, setContactMessage] = useState('')
  const [contactHoneypot, setContactHoneypot] = useState('')
  const [isContactSubmitting, setIsContactSubmitting] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)

  // Manage client-side submission cooldown
  useEffect(() => {
    const checkCooldown = () => {
      const lastSubmit = localStorage.getItem('mkt-notes-last-support-submit')
      if (lastSubmit) {
        const diff = Date.now() - parseInt(lastSubmit, 10)
        const remaining = Math.ceil((60000 - diff) / 1000)
        if (remaining > 0) {
          setCooldownSeconds(remaining)
          return
        }
      }
      setCooldownSeconds(0)
    }

    checkCooldown()
    const interval = setInterval(checkCooldown, 1000)
    return () => clearInterval(interval)
  }, [isContactOpen])

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Honeypot check (immediate silent check)
    if (contactHoneypot.trim() !== '') {
      setIsContactOpen(false)
      toast.success(
        locale === 'es'
          ? 'Mensaje enviado correctamente. Nos pondremos en contacto pronto.'
          : 'Message sent successfully. We will contact you soon.'
      )
      return
    }

    // Client-side cooldown check
    if (cooldownSeconds > 0) {
      toast.error(
        locale === 'es'
          ? `Por favor, espera ${cooldownSeconds} segundos antes de enviar otro mensaje.`
          : `Please wait ${cooldownSeconds} seconds before sending another message.`
      )
      return
    }

    if (contactSubject.trim().length < 3 || contactSubject.length > 100) {
      toast.error(
        locale === 'es'
          ? 'El asunto debe tener entre 3 y 100 caracteres.'
          : 'Subject must be between 3 and 100 characters.'
      )
      return
    }

    if (contactMessage.trim().length < 10 || contactMessage.length > 1000) {
      toast.error(
        locale === 'es'
          ? 'El mensaje debe tener entre 10 y 1000 caracteres.'
          : 'Message must be between 10 and 1000 characters.'
      )
      return
    }

    try {
      setIsContactSubmitting(true)
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: contactCategory,
          subject: contactSubject,
          message: contactMessage,
          honeypot: contactHoneypot,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Error sending message')
      }

      // Success! Set cooldown in localStorage and state
      localStorage.setItem('mkt-notes-last-support-submit', Date.now().toString())
      setCooldownSeconds(60)

      toast.success(
        locale === 'es'
          ? 'Mensaje enviado correctamente. Nos pondremos en contacto pronto.'
          : 'Message sent successfully. We will contact you soon.'
      )

      // Reset form and close modal
      setContactSubject('')
      setContactMessage('')
      setContactHoneypot('')
      setIsContactOpen(false)
    } catch (err: any) {
      toast.error(err.message || 'Error sending message')
    } finally {
      setIsContactSubmitting(false)
    }
  }
  const supabase = createClient()
  const queryClient = useQueryClient()

  const handleResetPassword = async () => {
    if (!user?.email) return
    setIsResettingPassword(true)
    try {
      const host = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${host}/auth/reset-password`,
      })
      if (error) throw error
      toast.success(
        locale === 'es'
          ? `Correo de restablecimiento enviado a ${user.email}. Revisa tu bandeja de entrada.`
          : `Password reset email sent to ${user.email}. Check your inbox.`
      )
    } catch (error: any) {
      toast.error(error.message || (
        locale === 'es' ? 'Error al enviar el correo de restablecimiento.' : 'Error sending reset email.'
      ))
    } finally {
      setIsResettingPassword(false)
    }
  }

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setAvatarPreview(profile.avatar_url || '')
    }
  }, [profile])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      if (!e.target.files || e.target.files.length === 0) return
      const file = e.target.files[0]
      if (!file) return
      const fileExt = file.name.split('.').pop()
      const filePath = `${user?.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setAvatarPreview(publicUrl)

      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      })

      const res = await fetch('/api/sync-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          avatarUrl: publicUrl,
          fullName: fullName
        })
      })

      if (!res.ok) throw new Error("Error syncing profile in DB")

      await queryClient.invalidateQueries({ queryKey: ['user'] })
      toast.success(t('update_success'))
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      await supabase.auth.updateUser({
        data: { full_name: fullName }
      })

      const res = await fetch('/api/sync-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          fullName: fullName,
          avatarUrl: avatarPreview
        })
      })

      if (!res.ok) throw new Error("Error syncing profile in DB")

      toast.success(t('update_success'))
      await queryClient.invalidateQueries({ queryKey: ['user'] })
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <DashboardLayout><div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-brand" /></div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-background">
        {/* Top Control Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="text-sm font-semibold text-foreground">{t('identity_management')}</div>
            <div className="h-4 w-[1px] bg-border" />
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span>{t('account')}</span>
              <ChevronRight size={12} className="opacity-30" />
              <span className="text-brand">{t('profile_credentials')}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">{t('secure_session')}</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
            <div className="flex flex-col gap-1">
              <div className="technical-label text-brand">{t('personnel_profile')}</div>
              <h1 className="text-4xl font-light tracking-tight" style={{ fontFamily: "var(--font-clash), sans-serif" }}>{t('neural_identity')}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* Left Column: Form */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
                <div className="border border-border bg-card rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-border bg-accent/5">
                    <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <User size={14} className="text-brand" />
                      {t('biometric_data')}
                    </span>
                  </div>
                  <form onSubmit={handleUpdateProfile}>
                    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-10">
                      <div className="flex items-center gap-4 sm:gap-8">
                        <div className="relative group">
                          <Avatar className="h-24 w-24 rounded-full border border-border group-hover:border-brand transition-all duration-300 shadow-sm">
                            <AvatarImage src={avatarPreview || undefined} />
                            <AvatarFallback className="bg-accent/5 text-brand text-2xl font-bold rounded-full">
                              {fullName?.charAt(0) || user?.email?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <label className="absolute -bottom-1 -right-1 h-8 w-8 bg-brand text-white rounded-full cursor-pointer shadow-xl flex items-center justify-center hover:scale-105 transition-all border border-background">
                            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                          </label>
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm font-semibold text-foreground">{t('neural_photo')}</h3>
                          <p className="text-xs font-medium text-muted-foreground/70 leading-normal">{t('neural_photo_desc')}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground/70 ml-1">{t('full_legal_name')}</label>
                          <Input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="h-10 border-border bg-card rounded-sm text-sm"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground/70 ml-1">{t('verified_email')}</label>
                          <div className="relative">
                            <Input
                              value={user?.email || ''}
                              disabled
                              className="h-10 border-border bg-accent/5 rounded-sm pl-9 text-sm opacity-50 cursor-not-allowed"
                            />
                            <Mail size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/30" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 sm:px-8 pb-4 sm:pb-8 flex justify-end">
                      <Button type="submit" disabled={isSaving} className="h-10 rounded-full bg-brand text-white text-xs font-semibold px-8 hover:opacity-90">
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('update_protocol')}
                      </Button>
                    </div>
                  </form>
                </div>

                <div className="border border-border bg-card rounded-xl p-6 flex items-center justify-between shadow-sm group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 border border-border rounded-xl flex items-center justify-center text-muted-foreground/30 group-hover:text-brand transition-colors">
                      <Lock size={18} />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold text-foreground">{t('security_credentials')}</div>
                      <div className="text-xs text-muted-foreground/60">{t('rotation_keys')}</div>
                    </div>
                  </div>
                  <Button
                    onClick={handleResetPassword}
                    disabled={isResettingPassword}
                    className="h-9 rounded-lg bg-accent/5 border border-border text-xs font-medium text-foreground hover:bg-brand/10 hover:text-brand transition-all px-4 flex items-center gap-1.5"
                  >
                    {isResettingPassword && <Loader2 size={12} className="animate-spin" />}
                    {t('reset_access_keys')}
                  </Button>
                </div>
              </div>

              {/* Right Column: Status */}
              <div className="space-y-8">
                <div className={cn(
                  "border p-4 sm:p-6 lg:p-8 rounded-xl h-fit space-y-4 sm:space-y-6 lg:space-y-8 relative overflow-hidden transition-all duration-500",
                  isPro ? "border-brand bg-brand/5 shadow-xl shadow-brand/5" : "border-border bg-card"
                )}>
                  <ShieldCheck size={32} className={isPro ? "text-brand" : "text-muted-foreground/10"} />

                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <div className="text-xs font-medium text-muted-foreground/70">{t('verification_tier')}</div>
                      <h2 className="text-2xl font-light tracking-tight" style={{ fontFamily: "var(--font-clash), sans-serif" }}>
                        {isPro ? t('enterprise_elite') : t('standard_tier')}
                      </h2>
                    </div>

                    <p className="text-sm text-muted-foreground/80 leading-relaxed">
                      {isPro
                        ? t('pro_status_desc')
                        : t('free_status_desc')}
                    </p>
                  </div>

                  {!isPro && (
                    <Button className="w-full h-10 bg-brand text-white text-xs font-semibold rounded-xl hover:opacity-90">
                      {t('elevate_tier')}
                    </Button>
                  )}

                  <div className="absolute -right-8 -bottom-8 opacity-[0.03] text-brand pointer-events-none">
                    <Fingerprint size={160} />
                  </div>
                </div>

                {/* Help & Support Hub */}
                <div className="border border-border p-4 sm:p-6 rounded-xl bg-card space-y-4 sm:space-y-6 relative overflow-hidden shadow-sm">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-widest text-brand font-bold block">
                      {t('help_hub.title')}
                    </span>
                    <p className="text-xs text-muted-foreground/70 leading-normal">
                      {t('help_hub.desc')}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {/* Interactive Tour Button */}
                    <div className="border border-border/60 rounded-xl p-3 bg-accent/5 hover:border-brand/30 hover:bg-brand/[0.02] transition-all group duration-300">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <HelpCircle size={13} className="text-brand" />
                          {t('help_hub.system_guide')}
                        </span>
                        <span className="text-[11px] text-muted-foreground/80 leading-normal">
                          {t('help_hub.system_guide_desc')}
                        </span>
                        <Button
                          onClick={handleStartTour}
                          size="sm"
                          variant="outline"
                          className="w-fit h-8 rounded-full border-brand/20 hover:border-brand hover:bg-brand/10 text-brand text-[10px] uppercase font-bold tracking-wider mt-1 px-4"
                        >
                          {t('help_hub.start_tour_btn')}
                        </Button>
                      </div>
                    </div>

                    {/* Direct Support via Email */}
                    <div className="border border-border/60 rounded-xl p-3 bg-accent/5 hover:border-brand/30 hover:bg-brand/[0.02] transition-all group duration-300">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <Mail size={13} className="text-brand" />
                          {t('help_hub.direct_support')}
                        </span>
                        <span className="text-[11px] text-muted-foreground/80 leading-normal">
                          {t('help_hub.direct_support_desc')}
                        </span>
                        <Button
                          onClick={() => {
                            setContactCategory('ayuda')
                            setContactSubject('')
                            setContactMessage('')
                            setContactHoneypot('')
                            setIsContactOpen(true)
                          }}
                          size="sm"
                          variant="outline"
                          className="w-fit h-8 rounded-full border-brand/20 hover:border-brand hover:bg-brand/10 text-brand text-[10px] uppercase font-bold tracking-wider mt-1 px-4"
                        >
                          {t('help_hub.request_help_btn')}
                        </Button>
                      </div>
                    </div>

                    {/* Feedback and Listening Box */}
                    <div className="border border-border/60 rounded-xl p-3 bg-accent/5 hover:border-brand/30 hover:bg-brand/[0.02] transition-all group duration-300">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <Send size={13} className="text-brand" />
                          {t('help_hub.feedback_listen')}
                        </span>
                        <span className="text-[11px] text-muted-foreground/80 leading-normal">
                          {t('help_hub.feedback_listen_desc')}
                        </span>
                        <Button
                          onClick={() => {
                            setContactCategory('mejoras y correccion')
                            setContactSubject('')
                            setContactMessage('')
                            setContactHoneypot('')
                            setIsContactOpen(true)
                          }}
                          size="sm"
                          variant="outline"
                          className="w-fit h-8 rounded-full border-brand/20 hover:border-brand hover:bg-brand/10 text-brand text-[10px] uppercase font-bold tracking-wider mt-1 px-4"
                        >
                          {t('help_hub.send_feedback_btn')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Support & Feedback Dialog */}
      <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
        <DialogContent className="sm:max-w-[480px] border border-border bg-card shadow-2xl p-6 rounded-2xl">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              {contactCategory === 'ayuda' ? (
                <>
                  <Mail size={18} className="text-brand" />
                  {t('help_hub.direct_support')}
                </>
              ) : (
                <>
                  <Send size={18} className="text-brand" />
                  {t('help_hub.feedback_listen')}
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-normal">
              {contactCategory === 'ayuda'
                ? t('help_hub.direct_support_desc')
                : t('help_hub.feedback_listen_desc')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleContactSubmit} className="space-y-4 mt-2">
            {/* Honeypot Anti-spam (Hidden from users) */}
            <div className="absolute opacity-0 pointer-events-none -z-10 h-0 w-0 overflow-hidden">
              <label htmlFor="user_middle_name_verify">Ignore this field</label>
              <input
                id="user_middle_name_verify"
                type="text"
                value={contactHoneypot}
                onChange={(e) => setContactHoneypot(e.target.value)}
                autoComplete="off"
                tabIndex={-1}
              />
            </div>

            {/* Email Field (Disabled, showing they are verified) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">
                {locale === 'es' ? 'Email de Contacto' : 'Contact Email'}
              </label>
              <Input
                type="email"
                value={user?.email || ''}
                disabled
                className="h-10 border-border bg-accent/5 rounded-lg text-sm opacity-60 cursor-not-allowed"
              />
            </div>

            {/* Subject Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">
                {locale === 'es' ? 'Asunto' : 'Subject'}
              </label>
              <Input
                type="text"
                placeholder={
                  contactCategory === 'ayuda'
                    ? (locale === 'es' ? 'Ej. Problemas para sincronizar campañas' : 'e.g., Campaign sync issues')
                    : (locale === 'es' ? 'Ej. Sugerencia sobre el planificador' : 'e.g., Planner improvements')
                }
                value={contactSubject}
                onChange={(e) => setContactSubject(e.target.value)}
                maxLength={100}
                required
                className="h-10 border-border bg-card rounded-lg text-sm"
              />
            </div>

            {/* Message Textarea */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">
                  {locale === 'es' ? 'Mensaje' : 'Message'}
                </label>
                <span className="text-[10px] text-muted-foreground/60">
                  {contactMessage.length}/1000
                </span>
              </div>
              <Textarea
                placeholder={
                  contactCategory === 'ayuda'
                    ? (locale === 'es' ? 'Describe detalladamente el problema...' : 'Describe your technical issue in detail...')
                    : (locale === 'es' ? 'Describe tu sugerencia o error detectado...' : 'Describe your suggestion or spotted issue...')
                }
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                maxLength={1000}
                required
                rows={5}
                className="border-border bg-card rounded-lg text-sm resize-none custom-scrollbar"
              />
            </div>

            {/* Cooldown Timer Alert */}
            {cooldownSeconds > 0 && (
              <div className="rounded-lg bg-brand/5 border border-brand/10 p-3 text-xs text-brand/80">
                {locale === 'es'
                  ? `Filtro anti-spam activo. Podrás enviar otro mensaje en ${cooldownSeconds}s.`
                  : `Anti-spam filter active. You can send another message in ${cooldownSeconds}s.`}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsContactOpen(false)}
                className="h-10 rounded-full border-border hover:bg-accent/10 text-xs font-semibold px-6"
              >
                {locale === 'es' ? 'Cancelar' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                disabled={isContactSubmitting || cooldownSeconds > 0}
                className="h-10 rounded-full bg-brand text-white text-xs font-semibold px-6 hover:opacity-90 disabled:opacity-50"
              >
                {isContactSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {locale === 'es' ? 'Enviando...' : 'Sending...'}
                  </>
                ) : (
                  locale === 'es' ? 'Enviar' : 'Send'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
