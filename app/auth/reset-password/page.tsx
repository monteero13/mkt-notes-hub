'use client';

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { KeyRound, Loader2, Save, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check if we have a session (recovery links log the user in automatically)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Sesión de recuperación expirada o inválida')
        router.push('/login')
      }
    }
    checkSession()
  }, [supabase, router])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      
      toast.success('Contraseña actualizada correctamente')
      router.push('/')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar la contraseña')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="mt-6 font-heading text-3xl font-bold tracking-tight text-foreground">
            Nueva contraseña
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Elige una contraseña segura que puedas recordar
          </p>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">Restablecer clave</CardTitle>
            <CardDescription>Introduce tu nueva contraseña a continuación</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 h-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 h-11"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar nueva contraseña
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full text-xs" onClick={() => router.push('/login')}>
              <ArrowLeft className="mr-2 h-3.5 w-3.5" />
              Cancelar y volver
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
