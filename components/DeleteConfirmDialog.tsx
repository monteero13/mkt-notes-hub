'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
interface DeleteConfirmDialogProps {
  children: React.ReactNode
  onConfirm: () => void
  title?: string
  description?: string
}

export function DeleteConfirmDialog({
  children,
  onConfirm,
  title,
  description
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-sm border border-border bg-background shadow-2xl p-8 max-w-md">
        <AlertDialogHeader className="mb-8 text-left">
          <AlertDialogTitle className="text-xl font-black tracking-tighter uppercase text-foreground">
            {title || "¿Estás seguro?"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[10px] technical-label opacity-60 uppercase mt-1">
            {description || "Esta acción no se puede deshacer."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center gap-3">
          <AlertDialogCancel className="h-10 rounded-sm px-4 technical-label text-[10px] border-border hover:bg-white/5 m-0 flex-1 uppercase">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="h-10 rounded-sm px-4 technical-label text-[10px] font-black bg-destructive text-white hover:opacity-90 shadow-lg shadow-destructive/10 flex-1 m-0 uppercase"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
