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
import { PageHeader } from '@/components/PageHeader'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

export default function PerfilPage() {
  const { t } = useTranslation();
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
        toast.error(t('perfil.avatar_error'))
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

      if (!res.ok) throw new Error(t('perfil.sync_error'))
      
      // FORZAR ACTUALIZACIÓN GLOBAL
      await queryClient.invalidateQueries({ queryKey: ['user'] })
      await queryClient.refetchQueries({ queryKey: ['user'] })
      
      toast.success(t('perfil.avatar_success'))
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

      if (!res.ok) throw new Error(t('perfil.sync_error'))

      toast.success(t('perfil.update_success'))
      
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
      <div className="p-6 space-y-4 h-full overflow-hidden flex flex-col">
        <div className="flex items-center justify-between shrink-0">
            <PageHeader 
                title={t('perfil.title')} 
                description={t('perfil.desc')} 
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
          <div className="md:col-span-2 space-y-4 h-full flex flex-col">
            <Card className="border-border/50 bg-card/50 flex-1 flex flex-col min-h-0">
              <CardHeader className="pb-2 shrink-0">
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  {t('perfil.personal_info')}
                </CardTitle>
                <CardDescription>{t('perfil.personal_info_desc')}</CardDescription>
              </CardHeader>
              <form onSubmit={handleUpdateProfile} className="flex flex-col flex-1 min-h-0">
                <CardContent className="space-y-4 flex-1 overflow-y-auto pt-2">
                  <div className="flex items-center gap-4 pb-4 border-b border-border/50">
                    <div className="relative group">
                      <Avatar className="h-20 w-20 border-2 border-border group-hover:border-primary/50 transition-all">
                        <AvatarImage src={avatarPreview || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold font-heading uppercase">
                          {fullName?.charAt(0) || user?.email?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <label className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full cursor-pointer shadow-lg hover:scale-110 transition-all">
                        {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                      </label>
                    </div>
                    <div>
                      <h3 className="font-bold text-base">{t('perfil.photo')}</h3>
                      <p className="text-xs text-muted-foreground">{t('perfil.photo_desc')}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('perfil.full_name')}</label>
                      <Input 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={t('perfil.full_name_placeholder')}
                        className="bg-background/50 h-10"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-50">{t('perfil.email')}</label>
                      <div className="relative">
                        <Input 
                          value={user?.email || ''} 
                          disabled 
                          className="bg-muted h-10 pl-9 text-sm"
                        />
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 border-t border-border/50 p-3 shrink-0">
                  <Button type="submit" disabled={isSaving} className="w-full md:w-auto ml-auto px-8 h-10 font-bold text-xs">
                    {isSaving && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                    {t('perfil.save_changes')}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <Card className="border-border/50 bg-card/50 shrink-0">
              <CardHeader className="py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lock className="h-4 w-4 text-indigo-500" />
                  {t('perfil.security')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <Button variant="outline" className="w-full md:w-auto h-9 font-bold px-6 text-xs">
                  {t('perfil.reset_password')}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className={`border-none ${profile?.is_pro ? 'bg-gradient-to-br from-primary to-indigo-600 text-white shadow-xl shadow-primary/20' : 'bg-muted'}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <ShieldCheck className="h-10 w-10 opacity-50" />
                  {profile?.is_pro && (
                    <span className="bg-white/20 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">{t('perfil.pro_active')}</span>
                  )}
                </div>
                <CardTitle className="text-2xl font-bold font-heading mt-4">
                  {profile?.is_pro ? t('perfil.plan_pro') : t('perfil.plan_free')}
                </CardTitle>
                <CardDescription className={profile?.is_pro ? 'text-white/80' : ''}>
                  {profile?.is_pro ? t('perfil.pro_desc') : t('perfil.free_desc')}
                </CardDescription>
              </CardHeader>
              {!profile?.is_pro && (
                <CardFooter>
                  <Button asChild className="w-full bg-white text-primary hover:bg-slate-100 font-bold">
                    <a href="/pricing">{t('perfil.upgrade_btn')}</a>
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
