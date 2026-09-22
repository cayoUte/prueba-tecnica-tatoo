import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

type Tono = 'error' | 'exito' | 'aviso'

const TONOS: Record<Tono, string> = {
  error: 'border-rose-400/40 bg-rose-500/15 text-rose-100',
  exito: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-100',
  aviso: 'border-amber-400/40 bg-amber-500/15 text-amber-100',
}

export function Alert({ tono = 'error', children }: { tono?: Tono; children: ReactNode }) {
  return (
    // role="alert" hace que los lectores de pantalla anuncien el error
    // en cuanto aparece, sin que el usuario tenga que buscarlo.
    <div role="alert" className={cn('rounded-2xl border px-4 py-3 text-sm backdrop-blur', TONOS[tono])}>
      {children}
    </div>
  )
}
