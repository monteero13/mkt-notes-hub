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
import { cn } from '@/lib/utils'
interface ManageCategoriesDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function ManageCategoriesDialog({ open: controlledOpen, onOpenChange, trigger }: ManageCategoriesDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#7C3AED')

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen

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
        team_id: activeWorkspace.id,
        user_id: user.id
      }])

      if (error) throw error

      toast.success('Categoría añadida')
      setNewName('')
      await queryClient.invalidateQueries({ queryKey: ['task_categories'] })
    } catch (err: any) {
      console.error('Add Category Error Details:', {
        message: err?.message,
        details: err?.details,
        hint: err?.hint,
        code: err?.code,
        fullError: err
      })
      toast.error('Error: ' + (err?.message || 'Error desconocido'))
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

  const defaultTrigger = isLeader ? (
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
  );

  const finalTrigger = trigger !== undefined ? trigger : defaultTrigger;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {finalTrigger && (
        <DialogTrigger asChild>
          {finalTrigger}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border border-border bg-background shadow-2xl rounded-lg">
        <div className="p-8">
          <DialogHeader className="mb-6 text-left">
            <DialogTitle className="text-xl font-heading font-black tracking-tighter uppercase text-foreground">Tipos de Tarea</DialogTitle>
            <DialogDescription className="text-[10px] technical-label opacity-60 mt-1 uppercase">
              {isLeader ? 'Gestiona las categorías de tareas para tu equipo.' : 'Lista de categorías disponibles.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {isLeader && (
              <div className="flex flex-col gap-4 border border-border/60 rounded-xl p-4 bg-accent/5">
                <div className="space-y-1.5">
                  <label className="technical-label text-[9px] opacity-60 ml-1 uppercase tracking-wider">Nombre del Tipo de Tarea</label>
                  <Input
                    placeholder="Escribe el nombre de la categoría..."
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="h-10 rounded-lg bg-background border-border px-4 text-xs font-bold focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="technical-label text-[9px] opacity-60 ml-1 uppercase tracking-wider">Color del Tipo</label>
                  <div className="flex items-center gap-3">
                    {/* Preset Palette Selection */}
                    <div className="flex items-center gap-2">
                      {[
                        '#7C3AED', // Brand Violet
                        '#3B82F6', // Blue
                        '#10B981', // Emerald
                        '#F59E0B', // Amber
                        '#EF4444', // Red
                        '#EC4899', // Pink
                      ].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewColor(color)}
                          className={cn(
                            "w-6 h-6 rounded-full transition-all duration-200 relative active:scale-95 border",
                            newColor === color ? "scale-110 ring-2 ring-brand ring-offset-2 border-transparent" : "border-border hover:scale-105"
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    
                    <div className="w-px h-5 bg-border/60" />

                    {/* Custom Color Trigger */}
                    <label 
                      className="relative w-6 h-6 rounded-full border border-border cursor-pointer transition-all duration-200 hover:scale-105 overflow-hidden flex items-center justify-center active:scale-95" 
                      style={{ backgroundColor: newColor }}
                      title="Color personalizado"
                    >
                      <input
                        type="color"
                        value={newColor}
                        onChange={e => setNewColor(e.target.value)}
                        className="sr-only"
                        disabled={isSubmitting}
                      />
                      <div className="w-1.5 h-1.5 rounded-full bg-white mix-blend-difference" />
                    </label>
                  </div>
                </div>

                <Button 
                  onClick={handleAdd} 
                  className="w-full h-10 rounded-lg bg-brand text-white technical-label text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  <span>Crear Tipo</span>
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
