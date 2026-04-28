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
import { useTranslation } from 'react-i18next'

export function CreateIdeaDialog({ children }: { children?: React.ReactNode }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const { data: team } = useTeam()
  const queryClient = useQueryClient()
  const supabase = createClient()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error(t('pricing.login_required'))

      const response = await fetch('/api/create-entity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'idea',
          userId: user.id,
          teamId: team?.id || null,
          data: {
            title,
            category
          }
        })
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || t('dialogs.idea.error'))

      toast.success(t('dialogs.idea.success'))
      await queryClient.refetchQueries({ queryKey: ['ideas'] })
      setOpen(false)
      setTitle('')
      setCategory('')
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
            <Plus className="h-4 w-4" /> {t('ideas.new')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[1.5rem] border-2">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading font-bold uppercase tracking-tight">{t('dialogs.idea.title')}</DialogTitle>
          <DialogDescription className="text-muted-foreground/80">{t('dialogs.idea.desc')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t('dialogs.idea.label_title')}</label>
            <Input 
              placeholder={t('dialogs.idea.placeholder_title')} 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 rounded-xl"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t('dialogs.idea.label_category')}</label>
            <Input placeholder={t('dialogs.idea.placeholder_category')} value={category} onChange={(e) => setCategory(e.target.value)} className="h-12 rounded-xl" />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all active:scale-95">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t('dialogs.idea.submit')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
