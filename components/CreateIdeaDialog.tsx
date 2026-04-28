'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Lightbulb, Loader2, Plus } from 'lucide-react'
import { useTeam } from '@/hooks/use-team'

export function CreateIdeaDialog({ children }: { children?: React.ReactNode }) {
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
      if (!user) throw new Error('No autorizado. Por favor inicia sesión.')

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
      if (!response.ok) throw new Error(result.error || 'Error al capturar la idea')

      toast.success('Idea almacenada en el Banco de Ideas')
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
            <Plus className="h-4 w-4" /> Nueva Idea
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[1.5rem] border-2">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading font-bold uppercase tracking-tight">Captura Creativa</DialogTitle>
          <DialogDescription className="text-muted-foreground/80">No dejes escapar ninguna tendencia. Anota tu idea de forma rápida.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Concepto / Idea</label>
            <Input 
              placeholder="Ej: Podcast sobre IA generativa" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 rounded-xl"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Categoría / Tendencia</label>
            <Input placeholder="Ej: Tech / Podcast" value={category} onChange={(e) => setCategory(e.target.value)} className="h-12 rounded-xl" />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all active:scale-95">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar en el Banco'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
