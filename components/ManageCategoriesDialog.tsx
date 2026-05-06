'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Trash2, Plus, Settings2, Loader2, X } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useWorkspace } from '@/hooks/use-workspace'
import { useCategories } from '@/hooks/use-categories'
import { useQueryClient } from '@tanstack/react-query'
export function ManageCategoriesDialog() {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#7C3AED')

  const { user } = useAuth()
  const { activeWorkspace } = useWorkspace()
  const { data: categories = [], isLoading } = useCategories()

  const supabase = createClient()
  const queryClient = useQueryClient()

  const handleAdd = async () => {
    if (!newName.trim() || !user || !activeWorkspace) {
      toast.error('Indica un nombre para la categoría')
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('task_categories').insert([{
        name: newName,
        color: newColor,
        workspace_id: activeWorkspace.id,
        user_id: user.id
      }])

      if (error) throw error

      toast.success('Categoría añadida')
      setNewName('')
      await queryClient.invalidateQueries({ queryKey: ['task_categories'] })
    } catch (err: any) {
      console.error('Add Category Error:', err)
      toast.error('Error' + ': ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('task_categories').delete().eq('id', id)
      if (error) throw error
      toast.success('Categoría eliminada')
      await queryClient.invalidateQueries({ queryKey: ['task_categories'] })
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const isLeader = activeWorkspace?.role && !['viewer', 'client_guest'].includes(activeWorkspace.role);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isLeader ? (
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-3 rounded-sm border border-brand/20 text-brand bg-brand/5 hover:bg-brand/10 transition-all gap-2"
          >
            <Settings2 size={12} />
            <span className="technical-label text-[9px] text-brand">Configurar tipos</span>
          </Button>
        ) : (
          <div />
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border border-border bg-background shadow-2xl rounded-sm">
        <div className="p-8">
          <DialogHeader className="mb-8 text-left">
            <DialogTitle className="text-xl font-heading font-black tracking-tighter uppercase text-foreground">Tipos de Tarea</DialogTitle>
            <DialogDescription className="text-[10px] technical-label opacity-60 mt-1 uppercase">
              {isLeader ? 'Gestiona las categorías de tareas para tu equipo.' : 'Lista de categorías disponibles.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-8">
            {isLeader && (
              <div className="flex gap-2">
                <div className="flex-1 space-y-1.5">
                  <label className="technical-label text-[9px] opacity-60 ml-1">Label Name</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nueva categoría..."
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      className="h-10 rounded-sm bg-black border-border px-4 text-xs font-bold"
                      disabled={isSubmitting}
                    />
                    <div className="relative">
                      <Input
                        type="color"
                        value={newColor}
                        onChange={e => setNewColor(e.target.value)}
                        className="w-10 h-10 p-0 rounded-sm cursor-pointer border-border bg-black overflow-hidden"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
                <Button onClick={handleAdd} size="icon" className="h-10 w-10 mt-[23px] shrink-0 rounded-sm bg-brand text-white hover:opacity-90" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={16} />}
                </Button>
              </div>
            )}

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar border-t border-border pt-6">
              {categories.length > 0 ? categories.map((cat: any) => (
                <div key={cat.id} className="flex items-center justify-between p-3 rounded-sm border border-border bg-card hover:border-brand/40 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: cat.color }} />
                    <span className="technical-label text-[10px] text-foreground">{cat.name}</span>
                  </div>
                  {isLeader && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-sm text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                      onClick={() => handleDelete(cat.id)}
                    >
                      <X size={14} />
                    </Button>
                  )}
                </div>
              )) : !isLoading && (
                <div className="py-12 text-center border border-dashed border-border rounded-sm">
                  <div className="technical-label text-[9px] opacity-40 uppercase tracking-widest">
                    No hay categorías configuradas.
                  </div>
                </div>
              )}
              {isLoading && (
                <div className="flex justify-center py-12"><Loader2 size={16} className="animate-spin text-brand opacity-40" /></div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
