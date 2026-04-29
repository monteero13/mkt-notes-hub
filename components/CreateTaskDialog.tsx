'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Loader2 } from 'lucide-react'
import { useDashboardData } from '@/hooks/use-dashboard-data'
import { useTranslation } from 'react-i18next'

export function CreateTaskDialog({ children, defaultCampaignId, defaultDate, task }: { children?: React.ReactNode, defaultCampaignId?: string, defaultDate?: string, task?: any }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [campaignId, setCampaignId] = useState('')
  const [dueDate, setDueDate] = useState('')

  const { campaigns } = useDashboardData()
  const queryClient = useQueryClient()
  const supabase = createClient()

  // Sincronizar estados cuando cambia la tarea o los valores por defecto
  useEffect(() => {
    if (open) {
      if (task) {
        setTitle(task.title || '')
        setCampaignId(task.campaign_id || '')
        setDueDate(task.due_date || '')
      } else {
        setTitle('')
        setCampaignId(defaultCampaignId || '')
        setDueDate(defaultDate || '')
      }
    }
  }, [open, task, defaultCampaignId, defaultDate])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error(t('pricing.login_required'))

      const { data: profile } = await supabase.from('profiles').select('is_pro').eq('id', user.id).single()
      const { data: member } = await supabase.from('team_members').select('team_id').eq('user_id', user.id).single()

      if (task?.id) {
        // Update
        const { error } = await supabase.from('tasks').update({
          title,
          campaign_id: campaignId || null,
          due_date: dueDate || null
        }).eq('id', task.id)
        if (error) throw error
        toast.success(t('common.success'))
      } else {
        // Insert
        const { error } = await supabase.from('tasks').insert([{
          user_id: user.id,
          team_id: member?.team_id || null,
          title,
          campaign_id: campaignId || null,
          due_date: dueDate || null,
          status: 'pending',
          priority: 'medium'
        }])
        if (error) throw error
        toast.success(t('dialogs.task.success'))
      }

      await queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setOpen(false)
      if (!task) {
        setTitle('')
        setCampaignId(defaultCampaignId || '')
        setDueDate(defaultDate || '')
      }
    } catch (error: any) {
      toast.error(t('common.error') + ': ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" /> {t('campanas.add_task')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[1.5rem] border-2">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading font-bold uppercase tracking-tight">
            {task ? t('common.edit') : t('dialogs.task.title')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/80">
            {task ? t('common.edit') : t('dialogs.task.desc')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t('dialogs.task.label_title')}</label>
            <Input 
              placeholder={t('dialogs.task.placeholder_title')} 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t('dialogs.task.label_date')}</label>
              <Input 
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t('dialogs.task.label_campaign')}</label>
              <select 
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">{t('dialogs.task.no_campaign')}</option>
                {campaigns.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all active:scale-95">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : task ? t('common.save') : t('dialogs.task.submit')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
