'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Loader2, Target, ListTodo } from 'lucide-react'
import { useDashboardData } from '@/hooks/use-dashboard-data'

export function CreateTaskDialog({ children, defaultCampaignId }: { children?: React.ReactNode, defaultCampaignId?: string }) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [campaignId, setCampaignId] = useState(defaultCampaignId || '')
  
  const { campaigns } = useDashboardData()
  const queryClient = useQueryClient()
  const supabase = createClient()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autorizado')

      const { error } = await supabase.from('tasks').insert([{
        user_id: user.id,
        title,
        campaign_id: campaignId || null,
        status: 'pending',
        priority: 'medium'
      }])

      if (error) throw error

      toast.success('Misión táctica asignada')
      await queryClient.refetchQueries({ queryKey: ['tasks'] })
      await queryClient.refetchQueries({ queryKey: ['campaigns'] })
      setOpen(false)
      setTitle('')
    } catch (error: any) {
      toast.error('Error al crear tarea: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val)
      if (val && defaultCampaignId) setCampaignId(defaultCampaignId)
    }}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" /> Nueva Misión
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[1.5rem] border-2">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading font-bold uppercase tracking-tight">Nueva Misión</DialogTitle>
          <DialogDescription className="text-muted-foreground/80">Define una acción táctica concreta para impulsar tu estrategia.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Título de la Misión</label>
            <Input 
              placeholder="Ej: Redactar copy para Ads, Grabar Reel..." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Vincular a Estrategia</label>
            <select 
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Sin campaña asignada</option>
              {campaigns.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all active:scale-95">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Asignar Misión'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
