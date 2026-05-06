'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, Camera, ShieldCheck, User, Mail, Lock, ChevronRight, Fingerprint } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardLayout } from '@/components/DashboardLayout'
import { useQueryClient } from '@tanstack/react-query'
import { useWorkspace } from '@/hooks/use-workspace'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

export default function PerfilPage() {
  const { user, profile, isLoading } = useAuth()
  const { isPro } = useWorkspace()
  const t = useTranslations('settings')
  const [isSaving, setIsSaving] = useState(false)
  const [fullName, setFullName] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()
  const queryClient = useQueryClient()

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
                  <Button className="h-9 rounded-lg bg-accent/5 border border-border text-xs font-medium text-foreground hover:bg-brand/10 hover:text-brand transition-all px-4">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
