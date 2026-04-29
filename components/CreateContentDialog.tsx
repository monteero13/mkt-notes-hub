'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'
import { useTeam } from '@/hooks/use-team'
import { useAuth } from '@/hooks/use-auth'
import { useTranslation } from 'react-i18next'

export function CreateContentDialog({ children }: { children?: React.ReactNode }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [platform, setPlatform] = useState('')
  const [type, setType] = useState('')
  const { data: team } = useTeam()
  const queryClient = useQueryClient()
  const supabase = createClient()

  const { profile } = useAuth()
  const { data: content = [] } = useQueryClient().getQueryData(['content']) as any || { data: [] }
  const isLimitReached = !profile?.is_pro && Array.isArray(content) && content.length >= 4;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || isLimitReached) return

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error(t('pricing.login_required'))

      const response = await fetch('/api/create-entity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'content',
          userId: user.id,
          teamId: team?.id || null,
          data: {
            title,
            platform,
            type,
            status: 'draft',
            date: new Date().toISOString().split('T')[0]
          }
        })
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || t('dialogs.content.error'))

      toast.success(t('dialogs.content.success'))
      await queryClient.refetchQueries({ queryKey: ['content'] })
      setOpen(false)
      setTitle('')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" /> {t('contenido.new')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[1.5rem] border-2">
        {isLimitReached ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading font-bold uppercase tracking-tight text-primary">Límite Alcanzado</DialogTitle>
              <DialogDescription className="text-muted-foreground/80">
                El plan gratuito permite gestionar hasta 4 piezas de contenido en el calendario. Desbloquea planificación ilimitada con el plan PRO.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 flex justify-center">
               <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="text-3xl">📅</div>
               </div>
            </div>
            <Button className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all active:scale-95 bg-primary text-white" onClick={() => window.location.href = '/pricing'}>
               Actualizar a PRO
            </Button>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading font-bold uppercase tracking-tight">{t('dialogs.content.title')}</DialogTitle>
              <DialogDescription className="text-muted-foreground/80">{t('dialogs.content.desc')}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t('dialogs.content.label_title')}</label>
                <Input 
                  placeholder={t('dialogs.content.placeholder_title')} 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-12 rounded-xl"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t('dialogs.content.label_platform')}</label>
                  <Input placeholder={t('dialogs.content.placeholder_platform')} value={platform} onChange={(e) => setPlatform(e.target.value)} className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t('dialogs.idea.label_category')}</label>
                  <Input placeholder="Ej: Reel" value={type} onChange={(e) => setType(e.target.value)} className="h-12 rounded-xl" />
                </div>
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all active:scale-95">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t('dialogs.content.submit')}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
