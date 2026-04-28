'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Loader2 } from 'lucide-react'
import { useTeam } from '@/hooks/use-team'
import { useTranslation } from 'react-i18next'

export function CreateCampaignDialog({ children }: { children?: React.ReactNode }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [channel, setChannel] = useState('')
  const { data: team } = useTeam()
  const queryClient = useQueryClient()
  const supabase = createClient()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error(t('pricing.login_required'))

      const response = await fetch('/api/create-entity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'campaign',
          userId: user.id,
          teamId: team?.id || null,
          data: {
            name,
            channel,
            status: 'planning',
            progress: 0
          }
        })
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || t('dialogs.campaign.error'))

      toast.success(t('dialogs.campaign.success'))
      await queryClient.refetchQueries({ queryKey: ['campaigns'] })
      setOpen(false)
      setName('')
      setChannel('')
    } catch (error: any) {
      toast.error(t('dialogs.campaign.error') + ': ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> {t('campanas.new')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[1.5rem] border-2">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading font-bold uppercase tracking-tight">{t('dialogs.campaign.title')}</DialogTitle>
          <DialogDescription className="text-muted-foreground/80">{t('dialogs.campaign.desc')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t('dialogs.campaign.label_name')}</label>
            <Input 
              placeholder={t('dialogs.campaign.placeholder_name')} 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-xl focus:ring-primary/20"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t('dialogs.campaign.label_channel')}</label>
            <Input 
              placeholder={t('dialogs.campaign.placeholder_channel')} 
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="h-12 rounded-xl focus:ring-primary/20"
            />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all active:scale-95">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t('dialogs.campaign.submit')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
