'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Loader2, Plus, Target, BarChart } from 'lucide-react'
import { useTeam } from '@/hooks/use-team'
import { useAuth } from '@/hooks/use-auth'
import { PremiumLimitModal } from './PremiumLimitModal'

export function CreateObjectiveDialog({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [kpi, setKpi] = useState('')
  const [targetValue, setTargetValue] = useState('')
  const { data: team } = useTeam()
  const queryClient = useQueryClient()
  const supabase = createClient()

  const { data: objectives = [] } = useQueryClient().getQueryData(['objectives']) as any || { data: [] }
  const { profile } = useAuth()

  const isLimitReached = !profile?.is_pro && Array.isArray(objectives) && objectives.length >= 5;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || isLimitReached) return

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Debes iniciar sesión para suscribirte')

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
            deadline: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]
          }
        })
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Error al crear objetivo')

      toast.success('Objetivo fijado con éxito')
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
          <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 rounded-2xl px-6 h-12 font-bold uppercase tracking-widest text-[10px]">
            <Plus className="h-4 w-4" /> Nuevo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl rounded-[3rem]">
        <div className="bg-background/95 backdrop-blur-2xl p-10 bg-gradient-to-br from-primary/10 via-transparent to-transparent">
          {isLimitReached ? (
            <PremiumLimitModal
              title="Límite Alcanzado"
              description="El plan gratuito permite gestionar hasta 5 objetivos estratégicos. Desbloquea objetivos ilimitados y análisis avanzado con el plan PRO."
              onClose={() => setOpen(false)}
            />
          ) : (
            <>
              <DialogHeader className="mb-10 text-center">
                <DialogTitle className="text-4xl font-heading font-black uppercase tracking-tighter bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent flex items-center justify-center gap-4">
                  <Target className="h-10 w-10 text-primary" />
                  Nuevo Objetivo Estratégico
                </DialogTitle>
                <DialogDescription className="text-muted-foreground font-medium mt-2">Define una meta clara y medible para tu estrategia de marketing.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-8">
                <div className="space-y-3 group">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-2 group-focus-within:text-primary transition-colors">Qué quieres conseguir</label>
                  <Input
                    placeholder="Ej: Incrementar leads en Q3"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-16 rounded-[1.5rem] border-none bg-primary/5 focus:bg-primary/10 transition-all text-base font-bold px-8 shadow-inner"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3 group">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-2 flex items-center gap-2">
                      <BarChart className="h-3 w-3" /> KPI a medir
                    </label>
                    <Input
                      placeholder="Conversiones, Alcance, etc."
                      value={kpi}
                      onChange={(e) => setKpi(e.target.value)}
                      className="h-16 rounded-[1.5rem] border-none bg-primary/5 focus:bg-primary/10 transition-all text-base font-bold px-8 shadow-inner"
                    />
                  </div>
                  <div className="space-y-3 group">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-2">Valor objetivo</label>
                    <Input
                      type="number"
                      placeholder="Ej: 500"
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                      className="h-16 rounded-[1.5rem] border-none bg-primary/5 focus:bg-primary/10 transition-all text-base font-bold px-8 shadow-inner"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full h-16 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-[0.97] mt-6 bg-primary text-primary-foreground">
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Fijar Objetivo'}
                </Button>
              </form>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
