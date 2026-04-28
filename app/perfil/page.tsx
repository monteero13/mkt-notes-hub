'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, Camera, ShieldCheck, User, Mail, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardLayout } from '@/components/DashboardLayout'
import { useQueryClient } from '@tanstack/react-query'

export default function PerfilPage() {
  const { user, profile, isLoading } = useAuth()
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
      const fileExt = file.name.split('.').pop()
      const filePath = `${user?.id}/${Date.now()}.${fileExt}`

      // Subir imagen al bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Error de Storage:', uploadError)
        toast.error('No se pudo subir la imagen. Verifica que el bucket "avatars" sea público.')
        return
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setAvatarPreview(publicUrl)
      
      // 1. Sincronizar en Auth Metadata
      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      })

      // 2. Sincronizar en DB usando API segura (Bypass RLS)
      const res = await fetch('/api/sync-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          avatarUrl: publicUrl,
          fullName: fullName
        })
      })

      if (!res.ok) throw new Error('Error al sincronizar perfil en DB')
      
      // FORZAR ACTUALIZACIÓN GLOBAL
      await queryClient.invalidateQueries({ queryKey: ['user'] })
      await queryClient.refetchQueries({ queryKey: ['user'] })
      
      toast.success('Avatar actualizado con éxito')
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
      // 1. Sincronizar en Auth Metadata
      await supabase.auth.updateUser({
        data: { full_name: fullName }
      })

      // 2. Sincronizar en DB usando API segura
      const res = await fetch('/api/sync-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          fullName: fullName,
          avatarUrl: avatarPreview
        })
      })

      if (!res.ok) throw new Error('Error al sincronizar perfil en DB')

      toast.success('Perfil actualizado correctamente')
      
      // FORZAR ACTUALIZACIÓN GLOBAL
      await queryClient.invalidateQueries({ queryKey: ['user'] })
      await queryClient.refetchQueries({ queryKey: ['user'] })
      
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <DashboardLayout><div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-10 space-y-8 px-4">
        <div>
          <h1 className="text-4xl font-bold font-heading">Ajustes de Cuenta</h1>
          <p className="text-muted-foreground mt-1">Gestiona tu identidad y configuración personal.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Información Personal
                </CardTitle>
                <CardDescription>Esta información será visible para otros miembros de tu equipo.</CardDescription>
              </CardHeader>
              <form onSubmit={handleUpdateProfile}>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6 pb-6 border-b border-border/50">
                    <div className="relative group">
                      <Avatar className="h-24 w-24 border-2 border-border group-hover:border-primary/50 transition-all">
                        <AvatarImage src={avatarPreview || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold font-heading uppercase">
                          {fullName?.charAt(0) || user?.email?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer shadow-lg hover:scale-110 transition-all">
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                      </label>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Foto de perfil</h3>
                      <p className="text-sm text-muted-foreground">PNG o JPG. Máximo 2MB.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Nombre Completo</label>
                    <Input 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Tu nombre"
                      className="bg-background/50 h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground opacity-50">Correo Electrónico (Solo Lectura)</label>
                    <div className="relative">
                      <Input 
                        value={user?.email || ''} 
                        disabled 
                        className="bg-muted h-12 pl-10"
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-[10px] text-muted-foreground italic">Ponte en contacto con soporte para cambiar tu correo corporativo.</p>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 border-t border-border/50 p-4">
                  <Button type="submit" disabled={isSaving} className="w-full md:w-auto ml-auto px-10 h-12 font-bold">
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar Cambios
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Lock className="h-5 w-5 text-indigo-500" />
                  Seguridad
                </CardTitle>
                <CardDescription>Cambia tu contraseña para mantener tu cuenta segura.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full md:w-auto h-12 font-bold px-8">
                  Enviar email de restablecimiento
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className={`border-none ${profile?.is_pro ? 'bg-gradient-to-br from-primary to-indigo-600 text-white shadow-xl shadow-primary/20' : 'bg-muted'}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <ShieldCheck className="h-10 w-10 opacity-50" />
                  {profile?.is_pro && (
                    <span className="bg-white/20 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Pro Activo</span>
                  )}
                </div>
                <CardTitle className="text-2xl font-bold font-heading mt-4">
                  {profile?.is_pro ? 'Plan Premium' : 'Plan Gratuito'}
                </CardTitle>
                <CardDescription className={profile?.is_pro ? 'text-white/80' : ''}>
                  {profile?.is_pro ? 'Tienes acceso total a todas las herramientas corporativas.' : 'Pásate a Pro para desbloquear equipos y campañas ilimitadas.'}
                </CardDescription>
              </CardHeader>
              {!profile?.is_pro && (
                <CardFooter>
                  <Button asChild className="w-full bg-white text-primary hover:bg-slate-100 font-bold">
                    <a href="/pricing">Mejorar Cuenta</a>
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
