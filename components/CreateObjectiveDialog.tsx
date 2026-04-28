'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Target, Loader2, Plus } from 'lucide-react'
import { useTeam } from '@/hooks/use-team'

export function CreateObjectiveDialog({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [kpi, setKpi] = useState('')
  const [targetValue, setTargetValue] = useState('')
  const { data: team } = useTeam()
  const queryClient = useQueryClient()
  const supabase = createClient()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autorizado. Por favor inicia sesión.')

      const response = await fetch('/api/create-entity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'objective',
          userId: user.id,
          teamId: team?.id || null,
          data: {
            title,
            kpi,
            target_value: parseFloat(targetValue) || 0,
            current_value: 0,
            deadline: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0] // 3 months default
          }
        })
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Error al establecer el objetivo')

      toast.success('Objetivo estratégico establecido')
      await queryClient.refetchQueries({ queryKey: ['objectives'] })
      setOpen(false)
      setTitle('')
      setKpi('')
      setTargetValue('')
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
            <Plus className="h-4 w-4" /> Nuevo Objetivo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[1.5rem] border-2">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading font-bold uppercase tracking-tight">Definir Meta (OKR)</DialogTitle>
          <DialogDescription className="text-muted-foreground/80">Establece objetivos ambiciosos y los KPIs para medirlos.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Objetivo Estratégico</label>
            <Input 
              placeholder="Ej: Aumentar conversiones en un 20%" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 rounded-xl"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">KPI Principal</label>
              <Input placeholder="Ej: Leads" value={kpi} onChange={(e) => setKpi(e.target.value)} className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Valor Meta</label>
              <Input type="number" placeholder="Ej: 500" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} className="h-12 rounded-xl" />
            </div>
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all active:scale-95">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Fijar Objetivo'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
