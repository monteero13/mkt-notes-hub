'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'
import { useWorkspace } from '@/hooks/use-workspace'
import { useContent } from '@/hooks/use-features-data'
import { useAuth } from '@/hooks/use-auth'
import { PremiumLimitModal } from './PremiumLimitModal'
import { useTranslations } from 'next-intl'
import type { ContentChannel } from '@/types'

const CHANNELS: ContentChannel[] = [
  'instagram', 'tiktok', 'youtube', 'linkedin',
  'facebook', 'twitter', 'email', 'blog', 'other',
]

export function CreateContentDialog({ children, campaignId }: { children?: React.ReactNode; campaignId?: string }) {
  const t = useTranslations('dialogs.content')
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [channel, setChannel] = useState<ContentChannel>('instagram')

  const { activeWorkspace } = useWorkspace()
  const { user, isPro } = useAuth()
  const { data: content = [] } = useContent()
  const queryClient = useQueryClient()

  const isLimitReached = !isPro && Array.isArray(content) && content.length >= 4

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || isLimitReached || !activeWorkspace) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/create-entity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'content',
          userId: user?.id,
          workspaceId: activeWorkspace.id,
          data: {
            title,
            channel,
            status: 'drafting',
            campaign_id: campaignId || null,
          },
        }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || t('error'))

      toast.success(t('success'))
      setOpen(false)
      setTitle('')
      setChannel('instagram')
      queryClient.invalidateQueries({ queryKey: ['content'] })
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
          <Button className="h-8 rounded-sm bg-brand px-4 technical-label text-[10px] text-white hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" /> Nuevo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border border-border bg-background shadow-2xl rounded-xl">
        {isLimitReached ? (
          <PremiumLimitModal
            title="Límite Alcanzado"
            description="El plan gratuito permite gestionar hasta 4 piezas de contenido. Desbloquea planificación ilimitada con el plan PRO."
            onClose={() => setOpen(false)}
          />
        ) : (
          <div className="p-8">
            <DialogHeader className="mb-8 text-left">
              <DialogTitle className="text-2xl font-light tracking-tight text-foreground" style={{ fontFamily: "var(--font-clash), sans-serif" }}>{t('title')}</DialogTitle>
              <DialogDescription className="text-[10px] technical-label opacity-60 mt-1 uppercase">{t('desc')}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <label className="technical-label text-[10px] text-foreground opacity-60">{t('label_title')}</label>
                <Input
                  placeholder={t('placeholder_title')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-12 rounded-sm border-border bg-background focus:border-brand transition-all text-sm font-medium px-4"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="technical-label text-[10px] text-foreground opacity-60">{t('label_platform')}</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as ContentChannel)}
                  className="w-full h-12 rounded-sm border border-border bg-background px-4 text-sm font-medium text-foreground focus:border-brand focus:outline-none transition-all capitalize"
                >
                  {CHANNELS.map((c) => (
                    <option key={c} value={c} className="capitalize">{c}</option>
                  ))}
                </select>
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-sm font-black uppercase tracking-[0.2em] text-[10px] mt-4 bg-brand text-white shadow-lg shadow-brand/10 hover:opacity-90"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t('submit')}
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
