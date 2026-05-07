'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { useDashboardData } from '@/hooks/use-dashboard-data'
import { PremiumLimitModal } from './PremiumLimitModal'
import { useWorkspace } from '@/hooks/use-workspace'

export function CreateCampaignDialog({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [channel, setChannel] = useState('')
  const [endDate, setEndDate] = useState('')

  const { activeWorkspace } = useWorkspace()
  const { user, isPro } = useAuth()
  const { campaigns } = useDashboardData()
  const queryClient = useQueryClient()
  const supabase = createClient()

  const isLimitReached = !isPro && campaigns.length >= 1;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || isLimitReached || !activeWorkspace) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/create-entity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'campaign',
          userId: user?.id,
          workspaceId: activeWorkspace.id,
          data: {
            name,
            end_date: endDate || null,
            status: 'draft',
          }
        })
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Error al crear la campaña')

      toast.success('Campaña lanzada con éxito')
      await queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      setOpen(false)
      setName('')
      setChannel('')
      setEndDate('')
    } catch (error: any) {
      toast.error('Error al crear la campaña' + ': ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2 bg-brand hover:opacity-90 transition-all active:scale-95 rounded-sm px-6 h-12 font-bold uppercase tracking-widest text-[10px]">
            <Plus className="h-4 w-4" /> Nueva
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className={cn(
        "sm:max-w-[440px] p-0 overflow-hidden border border-border bg-background shadow-2xl rounded-sm"
      )}>
        {isLimitReached ? (
          <PremiumLimitModal
            title="Límite Alcanzado"
            description="El plan gratuito permite gestionar 1 sola campaña. Desbloquea campañas ilimitadas y trabajo en equipo con el plan PRO."
            onClose={() => setOpen(false)}
          />
        ) : (
          <div className="p-8">
            <DialogHeader className="mb-8 text-left">
              <DialogTitle className="text-xl font-heading font-black tracking-tight text-foreground">Nueva Estrategia</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground/70 font-medium mt-1">Define el nombre y canal principal de tu próxima campaña para empezar a medir resultados.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2 group">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 ml-1">Nombre del proyecto</label>
                <Input
                  placeholder="Ej: Lanzamiento Verano 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 rounded-sm border-border bg-black focus:border-brand transition-all text-sm font-medium px-4"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 ml-1">Canal Principal</label>
                  <Input
                    placeholder="Ej: Instagram Ads, Email, TikTok..."
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="h-12 rounded-sm border-border bg-black focus:border-brand transition-all text-sm font-medium px-4"
                  />
                </div>
                <div className="space-y-2 group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 ml-1">Fecha Final</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-12 rounded-sm border-border bg-black focus:border-brand transition-all text-sm font-medium px-4"
                  />
                </div>
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-sm font-bold uppercase tracking-widest text-[10px] transition-all active:scale-[0.98] mt-4 bg-brand text-white shadow-lg shadow-brand/10 hover:opacity-90">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lanzar Campaña'}
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
