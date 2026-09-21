import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

type Tono = 'error' | 'exito' | 'aviso'

const TONOS: Record<Tono, string> = {
  error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200',
  exito:
    'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200',
  aviso: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200',
}

export function Alert({ tono = 'error', children }: { tono?: Tono; children: ReactNode }) {
  return (
    // role="alert" hace que los lectores de pantalla anuncien el error
    // en cuanto aparece, sin que el usuario tenga que buscarlo.
    <div role="alert" className={cn('rounded-lg border px-3.5 py-3 text-sm', TONOS[tono])}>
      {children}
    </div>
  )
}
