'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Link as LinkIcon, FileText, Image as ImageIcon, Loader2, Plus, Upload, Video, Globe } from 'lucide-react'
import { useWorkspace } from '@/hooks/use-workspace'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { PremiumLimitModal } from './PremiumLimitModal'
import { useTranslations } from 'next-intl'

export function CreateResourceDialog({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('dialogs.resource')
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [type, setType] = useState('image')
  const [file, setFile] = useState<File | null>(null)

  const { activeWorkspace } = useWorkspace()
  const { isPro } = useAuth()
  const queryClient = useQueryClient()
  const supabase = createClient()

  const { data: resources = [] } = queryClient.getQueryData(['content']) as any || { data: [] }
  const isLimitReached = !isPro && Array.isArray(resources) && resources.length >= 3;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isLimitReached || !activeWorkspace) return;

    if (!file && !url.trim() && !title.trim()) {
      toast.error(t('error'))
      return
    }

    setIsSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Debes iniciar sesión para suscribirte')

      let finalUrl = url
      let platform = 'Enlace'

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
        platform = 'Archivo Local'
      } else if (url.includes('instagram.com/reel') || url.includes('tiktok.com')) {
        platform = 'Social Media'
      }

      const response = await fetch('/api/create-entity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'content',
          workspaceId: activeWorkspace.id,
          data: {
            title: title || file?.name || 'Sin título',
            type,
            url: finalUrl,
            platform,
            status: 'published'
          }
        })
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || t('error'))

      toast.success(t('success'))
      setOpen(false)
      setTitle('')
      setUrl('')
      setFile(null)
      queryClient.invalidateQueries({ queryKey: ['content'] })
    } catch (error: any) {
      toast.error(error.message || t('error'));
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="h-8 rounded-sm bg-brand px-4 technical-label text-[10px] text-white hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" /> Añadir
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border border-border bg-background shadow-2xl rounded-xl">
        {isLimitReached ? (
          <PremiumLimitModal
            title="Límite Alcanzado"
            description="El plan gratuito permite guardar hasta 3 recursos. Desbloquea espacio ilimitado con el plan PRO."
            onClose={() => setOpen(false)}
          />
        ) : (
          <div className="p-8">
            <DialogHeader className="mb-8 text-left">
              <DialogTitle className="text-2xl font-light tracking-tight text-foreground" style={{ fontFamily: "var(--font-clash), sans-serif" }}>{t('title')}</DialogTitle>
              <DialogDescription className="text-[10px] technical-label opacity-60 mt-1 uppercase">{t('desc')}</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-6">
              <div className="relative group border border-dashed border-border rounded-xl p-6 text-center bg-muted/30 hover:border-brand/40 transition-all cursor-pointer">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp, application/pdf"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) {
                      setFile(f)
                      if (f.type.startsWith('image/')) setType('image')
                      else setType('document')
                      setUrl('')
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                    <Upload size={18} />
                  </div>
                  <p className="technical-label text-[9px] uppercase tracking-widest text-muted-foreground/60">
                    {file ? file.name : t('label_file')}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5 group">
                  <label className="technical-label text-[9px] opacity-60 ml-1 uppercase">{t('label_title')}</label>
                  <Input
                    placeholder={t('placeholder_title')}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-11 rounded-sm border-border bg-background focus:border-brand transition-all text-sm font-medium px-4"
                  />
                </div>

                <div className="space-y-1.5 group">
                  <label className="technical-label text-[9px] opacity-60 ml-1 uppercase">{t('label_url')}</label>
                  <div className="relative">
                    <Input
                      placeholder={t('placeholder_url')}
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value)
                        if (e.target.value) setFile(null)
                      }}
                      className="h-11 rounded-sm border-border bg-background focus:border-brand transition-all text-sm font-medium pl-10 pr-4"
                    />
                    <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="technical-label text-[9px] opacity-60 ml-1 uppercase">{t('label_type')}</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'image', icon: ImageIcon },
                      { id: 'video', icon: Video },
                      { id: 'document', icon: FileText },
                      { id: 'link', icon: Globe },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setType(item.id)}
                        className={cn(
                          "h-10 rounded-sm flex items-center justify-center border transition-all active:scale-95",
                          type === item.id
                            ? "bg-brand border-brand text-white shadow-lg shadow-brand/10"
                            : "bg-muted/30 border-border text-muted-foreground/40 hover:bg-accent/10"
                        )}
                      >
                        <item.icon size={18} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full h-11 rounded-sm font-black uppercase tracking-[0.2em] text-[10px] mt-4 bg-brand text-white shadow-lg shadow-brand/10 hover:opacity-90">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t('submit')}
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
