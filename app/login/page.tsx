'use client';

import { useState, useRef, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Github, Mail, KeyRound, Loader2, ArrowRight, User, Camera, X, Wand2, ArrowLeft, CheckCircle2, Info } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'magic-link' | 'verification-sent';

function LoginContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<AuthMode>('login')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const modeParam = searchParams.get('mode') as AuthMode
    if (modeParam && ['login', 'signup', 'forgot-password', 'magic-link'].includes(modeParam)) {
      setMode(modeParam)
    }
  }, [searchParams])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error('La imagen es demasiado grande. Máximo 2MB.')
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
        toast.success('¡Bienvenido de nuevo!')
        router.push('/dashboard')
        router.refresh()
      } else if (mode === 'signup') {
        // Sign Up
        const { data: { user }, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              full_name: fullName,
            }
          }
        })

        if (signUpError) throw signUpError

        if (user && avatarFile) {
          // Upload Avatar
          const fileExt = avatarFile.name.split('.').pop()
          const fileName = `${user.id}/avatar.${fileExt}`
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, avatarFile, { upsert: true })

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('avatars')
              .getPublicUrl(fileName)

            // Update user metadata with avatar URL
            await supabase.auth.updateUser({
              data: { avatar_url: publicUrl }
            })
          }
        }

        setMode('verification-sent')
      } else if (mode === 'forgot-password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
        })
        if (error) throw error
        toast.success('Email de recuperación enviado')
        setMode('verification-sent')
      } else if (mode === 'magic-link') {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        })
        if (error) throw error
        toast.success('Magic link enviado a tu email')
        setMode('verification-sent')
      }
    } catch (error: any) {
      toast.error(error.message || 'Error en la autenticación')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuth = async (provider: 'github' | 'google') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  if (mode === ('verification-sent' as any)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-xl shadow-xl text-center p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-6 animate-bounce">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl font-bold mb-2">¡Revisa tu bandeja de entrada!</CardTitle>
          <CardDescription className="text-base mb-8">
            Hemos enviado un enlace de confirmación a <span className="font-bold text-foreground">{email}</span>.
            Haz clic en el enlace para continuar.
          </CardDescription>
          <Button variant="outline" className="w-full" onClick={() => setMode('login')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al login
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:rotate-12">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="mt-6 font-heading text-3xl font-bold tracking-tight text-foreground">
            {mode === 'login' && 'Inicia sesión en mkt.notes'}
            {mode === 'signup' && 'Crea tu cuenta gratuita'}
            {mode === 'forgot-password' && 'Recupera tu acceso'}
            {mode === 'magic-link' && 'Entra sin contraseña'}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === 'login' && (
              <>
                ¿Aún no tienes cuenta?
                <button onClick={() => setMode('signup')} className="ml-1 font-semibold text-primary hover:underline">Regístrate aquí</button>
              </>
            )}
            {(mode === 'signup' || mode === 'forgot-password' || mode === 'magic-link') && (
              <>
                ¿Prefieres otra opción?
                <button onClick={() => setMode('login')} className="ml-1 font-semibold text-primary hover:underline">Volver al login</button>
              </>
            )}
          </p>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">
              {mode === 'forgot-password' ? 'Recuperación' : mode === 'magic-link' ? 'Magic Link' : 'Acceso rápido'}
            </CardTitle>
            <CardDescription>
              {mode === 'forgot-password' ? 'Te enviaremos un link para cambiar tu clave' : 'Usa tu cuenta favorita para continuar'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {(mode === 'login' || mode === 'signup') && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-11 transition-all hover:bg-slate-900 hover:text-white" onClick={() => handleOAuth('github')}>
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                  <Button variant="outline" className="h-11 transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200" onClick={() => handleOAuth('google')}>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    Google
                  </Button>
                </div>
                <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                  <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-[10px] leading-relaxed text-muted-foreground">
                    <span className="font-bold text-primary block mb-0.5">Nota para el equipo:</span>
                    Si ves un error {"'provider is not enabled'"}, asegúrate de habilitar Google/GitHub en el panel de <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="underline hover:text-primary">Supabase Auth</a>.
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground whitespace-nowrap">O continúa con email</span>
                  </div>
                </div>
              </>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div className="flex flex-col items-center gap-4 mb-2">
                    <div className="relative group">
                      <Avatar className="h-20 w-20 border-2 border-border transition-all group-hover:border-primary/50">
                        <AvatarImage src={avatarPreview || undefined} className="object-cover" />
                        <AvatarFallback className="bg-muted">
                          <User className="h-10 w-10 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                      <Button type="button" size="icon" variant="secondary" className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-lg border border-border" onClick={() => fileInputRef.current?.click()}>
                        <Camera className="h-4 w-4" />
                      </Button>
                      {avatarFile && (
                        <Button type="button" size="icon" variant="destructive" className="absolute -top-1 -right-1 h-6 w-6 rounded-full shadow-lg" onClick={removeAvatar}>
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Foto de perfil (opcional)</p>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nombre completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="fullName" type="text" placeholder="Juan Pérez" className="pl-10 h-11" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="nombre@ejemplo.com" className="pl-10 h-11" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>

              {(mode === 'login' || mode === 'signup') && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Contraseña</Label>
                    {mode === 'login' && (
                      <button type="button" onClick={() => setMode('forgot-password')} className="text-xs text-primary hover:underline">
                        ¿Olvidaste tu contraseña?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type="password" className="pl-10 h-11" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full h-11 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {mode === 'login' && 'Entrar'}
                    {mode === 'signup' && 'Crear cuenta'}
                    {mode === 'forgot-password' && 'Enviar recuperación'}
                    {mode === 'magic-link' && 'Enviar link mágico'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              {mode === 'login' && (
                <Button type="button" variant="ghost" className="w-full h-10 text-xs font-semibold hover:bg-primary/5 hover:text-primary" onClick={() => setMode('magic-link')}>
                  <Wand2 className="mr-2 h-3.5 w-3.5" />
                  Entrar con un link mágico (sin contraseña)
                </Button>
              )}
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-center text-[10px] text-muted-foreground w-full px-4">
              Al continuar, aceptas nuestros <Link href="/" className="underline text-muted-foreground hover:text-primary transition-colors">Términos de Servicio</Link> y <Link href="/" className="underline text-muted-foreground hover:text-primary transition-colors">Política de Privacidad</Link>.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <LoginContent />
    </Suspense>
  )
}
