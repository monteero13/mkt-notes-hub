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
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/use-auth'
import { useCategories } from '@/hooks/use-categories'
import { ManageCategoriesDialog } from './ManageCategoriesDialog'
import { cn } from '@/lib/utils'
import { useWorkspace } from '@/hooks/use-workspace'

export function CreateTaskDialog({ children, defaultCampaignId, defaultDate, task }: { children?: React.ReactNode, defaultCampaignId?: string, defaultDate?: string, task?: any }) {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [title, setTitle] = useState('')
  const [campaignId, setCampaignId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [categoryName, setCategoryName] = useState('')

  const { campaigns } = useDashboardData()
  const { data: categories = [] } = useCategories()
  const { user } = useAuth()
  const { activeWorkspace } = useWorkspace()
  const supabase = createClient()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (open) {
      if (task) {
        setTitle(task.title || '')
        setCampaignId(task.campaign_id || '')
        setDueDate(task.due_date || '')
        setCategoryName(task.category_name || '')
      } else {
        setTitle('')
        setCampaignId(defaultCampaignId || '')
        setDueDate(defaultDate || '')
        setCategoryName('')
      }
    }
  }, [open, task, defaultCampaignId, defaultDate])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !activeWorkspace) return

    setIsSubmitting(true)
    try {
      const selectedCategory = categories.find((c: any) => c.name === categoryName);

      const payload = {
        title,
        campaign_id: campaignId || null,
        due_date: dueDate || null,
        user_id: user?.id,
        workspace_id: activeWorkspace.id,
        status: task?.status || 'pending',
        priority: task?.priority || 'medium',
        category_name: selectedCategory?.name || null,
        category_color: selectedCategory?.color || null
      };

      let error;
      if (task?.id) {
        const res = await supabase.from('tasks').update(payload).eq('id', task.id)
        error = res.error
      } else {
        const res = await supabase.from('tasks').insert([payload])
        error = res.error
      }

      if (error) throw error

      toast.success(task ? t('common.success') : t('dialogs.task.success'))
      await queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setOpen(false)
    } catch (err: any) {
      console.error('CRITICAL: Task Save Error Details:', err)
      toast.error(t('common.error') + ': ' + (err.message || 'Error de conexión'))
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
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border border-border shadow-2xl rounded-sm bg-background">
        <div className="p-8">
          <DialogHeader className="mb-8 text-left">
            <DialogTitle className="text-xl font-heading font-black tracking-tight text-foreground">
              {task ? t('common.edit') : t('dialogs.task.title')}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground/70 font-medium mt-1">
              {t('dialogs.task.desc')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2 group">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 ml-1">{t('dialogs.task.label_title')}</label>
              <Input
                placeholder={t('dialogs.task.placeholder_title')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-12 rounded-sm border-border bg-black focus:border-brand transition-all text-sm font-medium px-4"
                required
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">{t('dialogs.task.label_type')}</label>
                {(!activeWorkspace || activeWorkspace.role === 'admin' || activeWorkspace.role === 'owner') && <ManageCategoriesDialog />}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat: any) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryName(cat.name)}
                    className={cn(
                      "px-3 py-1.5 rounded-sm text-[9px] font-bold uppercase tracking-wider border transition-all active:scale-95",
                      categoryName === cat.name ? "shadow-md ring-2 ring-primary/20" : "opacity-100"
                    )}
                    style={categoryName === cat.name
                      ? { backgroundColor: cat.color, borderColor: cat.color, color: '#fff' }
                      : { borderColor: cat.color + '20', color: cat.color, backgroundColor: cat.color + '05' }
                    }
                  >
                    {cat.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCategoryName('')}
                  className={cn(
                    "px-3 py-1.5 rounded-sm text-[9px] font-bold uppercase tracking-wider border transition-all",
                    !categoryName
                      ? "bg-foreground text-background border-foreground"
                      : "bg-muted/5 border-border text-muted-foreground hover:bg-muted/10"
                  )}
                >
                  {t('common.no_type')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 group">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 ml-1">{t('dialogs.task.label_date')}</label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-12 rounded-sm border-border bg-black focus:border-brand transition-all text-sm font-medium px-4"
                />
              </div>
              <div className="space-y-2 group">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 ml-1">{t('dialogs.task.label_campaign')}</label>
                <div className="relative">
                  <select
                    value={campaignId}
                    onChange={(e) => setCampaignId(e.target.value)}
                    className="flex h-12 w-full rounded-sm border border-border bg-black focus:border-brand transition-all text-sm font-medium px-4 appearance-none outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="" className="bg-background">{t('dialogs.task.no_campaign')}</option>
                    {campaigns.map((c: any) => (
                      <option key={c.id} value={c.id} className="bg-background">{c.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30 text-[10px]">
                    ▼
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-sm font-bold uppercase tracking-widest text-[10px] transition-all active:scale-[0.98] mt-4 bg-brand text-white shadow-lg shadow-brand/10 hover:opacity-90">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : task ? t('common.save') : t('dialogs.task.submit')}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
