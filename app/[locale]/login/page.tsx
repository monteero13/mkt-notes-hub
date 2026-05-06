'use client';

import { useState, useRef, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Apple, Mail, KeyRound, Loader2, ArrowRight, User, Camera, X, Wand2, ArrowLeft, CheckCircle2, ChevronRight, Fingerprint, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'magic-link' | 'verification-sent';

function LoginContent() {
  const t = useTranslations('login');
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [mode, setModeState] = useState<AuthMode>('login')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const queryClient = useQueryClient()

  useEffect(() => {
    const modeParam = searchParams.get('mode') as AuthMode
    if (modeParam && ['login', 'signup', 'forgot-password', 'magic-link'].includes(modeParam)) {
      setModeState(modeParam)
    }
  }, [searchParams])

  const setMode = (newMode: AuthMode) => {
    setModeState(newMode)
    router.replace(`/login?mode=${newMode}`, { scroll: false })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 2 * 1024 * 1024) {
        toast.error(t('errors.image_size'))
        return
      }
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error

        await queryClient.invalidateQueries({ queryKey: ['user'] })
        toast.success(t('success.login'))

        setTimeout(() => {
          window.location.assign('/dashboard')
        }, 800)
      } else if (mode === 'signup') {
        const { data: { user }, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: { full_name: fullName }
          }
        })

        if (signUpError) throw signUpError
        await queryClient.invalidateQueries({ queryKey: ['user'] })

        if (user && avatarFile) {
          try {
            const formData = new FormData()
            formData.append('file', avatarFile)
            formData.append('userId', user.id)

            const uploadRes = await fetch('/api/upload-avatar', {
              method: 'POST',
              body: formData,
            })

            if (uploadRes.ok) {
              const { url: publicUrl } = await uploadRes.json()
              await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }
              })
            }
          } catch (storageError) {
            console.error('Storage error:', storageError)
          }
        }

        setMode('verification-sent')
      } else if (mode === 'forgot-password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
        })
        if (error) throw error
        setMode('verification-sent')
      } else if (mode === 'magic-link') {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        })
        if (error) throw error
        setMode('verification-sent')
      }
    } catch (error: any) {
      toast.error(error.message || t('errors.auth_error'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuth = async (provider: 'apple' | 'google') => {
    try {
      const next = searchParams.get('next') || '/dashboard'
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      })
      if (error) throw error
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  if (mode === 'verification-sent') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md border border-border bg-card p-12 rounded-sm text-center space-y-8 shadow-sm">
          <div className="mx-auto h-16 w-16 border border-brand bg-brand/5 flex items-center justify-center rounded-sm">
            <CheckCircle2 className="h-8 w-8 text-brand" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tighter uppercase leading-none">{t('verification.title')}</h2>
            <p className="technical-label text-[9px] tracking-widest opacity-40">
              {t('verification.desc_prefix')} <span className="text-foreground">{email}</span>. {t('verification.desc_suffix')}
            </p>
          </div>
          <Button variant="outline" className="w-full h-10 rounded-sm technical-label text-[9px] hover:bg-brand/10 hover:text-brand transition-all" onClick={() => setMode('login')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('verification.back_btn')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Fingerprint size={800} className="text-brand" />
         </div>
      </div>

      <div className="w-full max-w-md space-y-10 relative z-10">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-sm border border-brand bg-brand/5 text-brand shadow-xl shadow-brand/5">
            <KeyRound className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">
              {mode === 'login' && t('terminal_title_login')}
              {mode === 'signup' && t('terminal_title_signup')}
              {mode === 'forgot-password' && t('terminal_title_forgot')}
              {mode === 'magic-link' && t('terminal_title_magic')}
            </h1>
            <div className="flex items-center justify-center gap-2">
              <span className="technical-label text-[8px] opacity-40 uppercase tracking-widest">{t('secure_gateway')}</span>
              <div className="h-1 w-1 rounded-full bg-brand" />
              <span className="technical-label text-[8px] text-brand">v4.0.0</span>
            </div>
          </div>
        </div>

        <div className="border border-border bg-card rounded-sm shadow-sm overflow-hidden">
          <div className="p-10 space-y-8">
            {(mode === 'login' || mode === 'signup') && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-10 rounded-sm technical-label text-[9px] transition-all hover:bg-brand/5 hover:text-brand hover:border-brand" onClick={() => handleOAuth('apple')}>
                    <Apple className="mr-2 h-4 w-4" />
                    {t('apple_id')}
                  </Button>
                  <Button variant="outline" className="h-10 rounded-sm technical-label text-[9px] transition-all hover:bg-brand/5 hover:text-brand hover:border-brand" onClick={() => handleOAuth('google')}>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    {t('google_id')}
                  </Button>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-4 technical-label text-[8px] opacity-20 whitespace-nowrap">{t('or_credential_auth')}</span>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-6">
              {mode === 'signup' && (
                <div className="space-y-6">
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative group">
                      <Avatar className="h-16 w-16 rounded-sm border border-border group-hover:border-brand transition-all shadow-sm">
                        <AvatarImage src={avatarPreview || undefined} className="object-cover grayscale" />
                        <AvatarFallback className="bg-accent/5">
                          <User className="h-8 w-8 text-muted-foreground/20" />
                        </AvatarFallback>
                      </Avatar>
                      <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 h-6 w-6 rounded-sm bg-brand text-white flex items-center justify-center cursor-pointer hover:scale-110 transition-all z-10 shadow-lg">
                        <Camera className="h-3 w-3" />
                        <input id="avatar-upload" type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                      </label>
                      {avatarFile && (
                        <button type="button" className="absolute -top-1 -right-1 h-5 w-5 rounded-sm bg-error text-white flex items-center justify-center z-10" onClick={removeAvatar}>
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    <span className="technical-label text-[8px] opacity-20 uppercase tracking-widest">{t('personnel_photo')} ({t('optional')})</span>
                  </div>
                  <div className="space-y-1.5">
                    <label className="technical-label text-[8px] opacity-40 ml-1">{t('full_personnel_name')}</label>
                    <Input placeholder={t('full_name_placeholder')} className="h-10 border-border bg-card rounded-sm text-[11px] font-bold" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="technical-label text-[8px] opacity-40 ml-1">{t('email_endpoint')}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/30" />
                  <Input type="email" placeholder={t('email_placeholder')} className="pl-9 h-10 border-border bg-card rounded-sm text-[11px] font-bold" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>

              {(mode === 'login' || mode === 'signup') && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between ml-1">
                    <label className="technical-label text-[8px] opacity-40">{t('password_key')}</label>
                    {mode === 'login' && (
                      <button type="button" onClick={() => setMode('forgot-password')} className="technical-label text-[8px] text-brand hover:underline">
                        {t('lost_key')}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/30" />
                    <Input type="password" placeholder="••••••••" className="pl-9 h-10 border-border bg-card rounded-sm text-[11px] font-bold" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-4">
                <Button type="submit" className="w-full h-10 bg-brand text-white technical-label text-[10px] rounded-sm hover:opacity-90 shadow-xl shadow-brand/10" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <div className="flex items-center gap-2">
                      {mode === 'login' && t('authorize_session')}
                      {mode === 'signup' && t('deploy_identity')}
                      {mode === 'forgot-password' && t('recover_keys')}
                      {mode === 'magic-link' && t('summon_access')}
                      <ArrowRight size={14} />
                    </div>
                  )}
                </Button>

                {mode === 'login' && (
                  <Button type="button" variant="outline" className="w-full h-10 border-dashed technical-label text-[9px] hover:bg-brand/5 hover:text-brand" onClick={() => setMode('magic-link')}>
                    <Wand2 className="mr-2 h-4 w-4 text-brand" />
                    {t('summon_magic_link')}
                  </Button>
                )}
              </div>
            </form>
          </div>

          <div className="bg-accent/5 p-6 border-t border-border flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 opacity-40">
              <ShieldCheck size={12} />
              <span className="technical-label text-[8px]">{t('end_to_end_encrypted')}</span>
            </div>
            <div className="h-3 w-[1px] bg-border/20" />
            <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="technical-label text-[9px] text-brand hover:underline">
               {mode === 'login' ? t('deploy_new_identity') : t('access_existing_node')}
            </button>
          </div>
        </div>

        <div className="text-center space-y-4">
          <p className="technical-label text-[8px] opacity-20 uppercase tracking-[0.2em] max-w-xs mx-auto">
            {t('terms_agreement')}
          </p>
          <Link href="/" className="inline-flex items-center gap-2 technical-label text-[9px] opacity-40 hover:opacity-100 transition-opacity">
            <ArrowLeft size={12} />
            {t('back_to_public')}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-brand/20" /></div>}>
      <LoginContent />
    </Suspense>
  )
}
