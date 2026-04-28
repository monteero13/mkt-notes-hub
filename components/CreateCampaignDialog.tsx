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

export function CreateCampaignDialog({ children }: { children?: React.ReactNode }) {
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
      if (!user) throw new Error('No autorizado. Por favor inicia sesión.')

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
      if (!response.ok) throw new Error(result.error || 'Error al crear la campaña')

      toast.success('Campaña lanzada con éxito')
      await queryClient.refetchQueries({ queryKey: ['campaigns'] })
      setOpen(false)
      setName('')
      setChannel('')
    } catch (error: any) {
      toast.error('Error al crear campaña: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Nueva Campaña
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[1.5rem] border-2">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading font-bold uppercase tracking-tight">Nueva Estrategia</DialogTitle>
          <DialogDescription className="text-muted-foreground/80">Define el nombre y canal principal de tu próxima campaña para empezar a medir resultados.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nombre del proyecto</label>
            <Input 
              placeholder="Ej: Lanzamiento Verano 2026" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-xl focus:ring-primary/20"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Canal Principal</label>
            <Input 
              placeholder="Ej: Instagram Ads, Email, TikTok..." 
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="h-12 rounded-xl focus:ring-primary/20"
            />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all active:scale-95">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lanzar Campaña'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
