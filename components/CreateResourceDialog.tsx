'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Link as LinkIcon, FileText, Image as ImageIcon, Loader2, Plus, Upload, Paperclip, Video, Globe } from 'lucide-react'
import { useTeam } from '@/hooks/use-team'
import { useAuth } from '@/hooks/use-auth'
import { useTranslation } from 'react-i18next'

export function CreateResourceDialog({ children }: { children?: React.ReactNode }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [type, setType] = useState('image')
  const [file, setFile] = useState<File | null>(null)
  
  const { data: team } = useTeam()
  const { profile } = useAuth()
  const queryClient = useQueryClient()
  const supabase = createClient()
  
  const { data: resources = [] } = queryClient.getQueryData(['content']) as any || { data: [] }
  const isLimitReached = !profile?.is_pro && Array.isArray(resources) && resources.length >= 3;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isLimitReached) return;
    
    if (!file && !url.trim() && !title.trim()) {
      toast.error(t('dialogs.resource.error'))
      return
    }

    setIsSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error(t('pricing.login_required'))

      let finalUrl = url
      let platform = t('common.link', 'Enlace')

      // Subida de archivo si existe
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('resources')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('resources')
          .getPublicUrl(filePath)
        
        finalUrl = urlData.publicUrl
        platform = t('common.local_file', 'Archivo Local')
      } else if (url.includes('instagram.com/reel') || url.includes('tiktok.com')) {
        platform = 'Social Media'
      }

      const { error: dbError } = await supabase.from('content').insert([{
        user_id: user.id,
        team_id: team?.id || null,
        title: title || file?.name || t('common.untitled', 'Recurso sin título'),
        type,
        url: finalUrl,
        platform,
        status: 'published'
      }])

      if (dbError) throw dbError

      toast.success(t('dialogs.resource.success'))
      await queryClient.refetchQueries({ queryKey: ['content'] })
      setOpen(false)
      setTitle('')
      setUrl('')
      setFile(null)
    } catch (error: any) {
      toast.error(error.message || t('dialogs.resource.error'));
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2 rounded-xl h-11 px-6 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" /> {t('biblioteca.add')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] border-2 p-8 overflow-hidden">
        {isLimitReached ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-card-foreground tracking-tighter uppercase text-primary">Límite Alcanzado</DialogTitle>
              <DialogDescription className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mt-2">
                El plan gratuito permite guardar hasta 3 recursos en tu biblioteca. Desbloquea espacio ilimitado y trabajo en equipo con el plan PRO.
              </DialogDescription>
            </DialogHeader>
            <div className="py-12 flex justify-center">
               <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="text-4xl">📚</div>
               </div>
            </div>
            <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-primary/20 transition-all active:scale-95 bg-primary text-white" onClick={() => window.location.href = '/pricing'}>
               Actualizar a PRO
            </Button>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-card-foreground tracking-tighter uppercase">{t('dialogs.resource.title')}</DialogTitle>
              <DialogDescription className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mt-2">{t('dialogs.resource.desc')}</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-8 mt-6">
              
              {/* UPLOAD SECTION */}
              <div className="relative group">
                  <input 
                    type="file" 
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) {
                        setFile(f)
                        if (f.type.startsWith('image/')) setType('image')
                        else setType('document')
                        setUrl('') // Limpiar URL si se sube archivo
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`border-2 border-dashed rounded-[2rem] p-6 text-center transition-all ${
                    file ? 'bg-primary/5 border-primary shadow-inner' : 'bg-muted/10 border-border/60 group-hover:border-primary/50'
                  }`}>
                    <div className={`h-12 w-12 rounded-2xl mx-auto mb-3 flex items-center justify-center transition-all ${
                      file ? 'bg-primary text-white scale-110 shadow-xl' : 'bg-muted/50 text-muted-foreground'
                    }`}>
                      {file ? <Paperclip className="h-5 w-5" /> : <Upload className="h-5 w-5 transition-transform group-hover:-translate-y-1" />}
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-card-foreground">
                      {file ? file.name : t('common.upload', 'Subida Directa')}
                    </p>
                    {!file && <p className="text-[9px] text-muted-foreground/40 font-bold uppercase mt-1">{t('common.drag_drop', 'Arrastra aquí tus archivos')}</p>}
                  </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary/80 ml-1">{t('dialogs.resource.label_title')}</label>
                  <Input 
                    placeholder={t('dialogs.resource.placeholder_title')} 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-12 rounded-xl bg-muted/20 border-none px-4 font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary/80 ml-1">{t('dialogs.resource.label_url')}</label>
                  <div className="relative">
                    <Input 
                      placeholder={t('dialogs.resource.placeholder_url')} 
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value)
                        if (e.target.value) setFile(null) // Priorizar URL si se escribe
                      }}
                      className="h-12 rounded-xl bg-muted/20 border-none pl-11"
                    />
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 pt-2">
                    {[
                      { id: 'image', label: t('common.image', 'Imagen'), icon: ImageIcon },
                      { id: 'video', label: 'Vídeo/Reel', icon: Video },
                      { id: 'document', label: 'Doc', icon: FileText },
                      { id: 'link', label: 'Link', icon: Globe },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setType(t.id)}
                        className={`py-3 rounded-2xl flex flex-col items-center gap-2 border transition-all ${
                          type === t.id ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(var(--primary),0.1)]' : 'bg-muted/10 border-transparent text-muted-foreground hover:bg-muted/30'
                        }`}
                      >
                        <t.icon className="h-4 w-4" />
                        <span className="text-[8px] font-black uppercase tracking-widest">{t.label}</span>
                      </button>
                    ))}
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-primary/20 transition-all active:scale-95 group">
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <div className="flex items-center gap-2">
                     {t('dialogs.resource.submit')} <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
                  </div>
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
