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
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"

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
  const { t } = useTranslation()

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-[2rem] border-2 p-8">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight">
            {title || t('common.delete_confirm_title', '¿Estás seguro?')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm font-medium text-muted-foreground/80">
            {description || t('common.delete_confirm_desc', 'Esta acción no se puede deshacer. Esto eliminará permanentemente el elemento.')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 gap-3">
          <AlertDialogCancel className="rounded-xl font-bold border-none bg-muted hover:bg-muted/80">
            {t('common.cancel', 'Cancelar')}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white border-none shadow-lg shadow-red-600/20"
          >
            {t('common.delete', 'Eliminar')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
