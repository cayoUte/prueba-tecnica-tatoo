import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { Spinner } from './Spinner'

type Variante = 'primario' | 'secundario' | 'fantasma' | 'peligro'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  cargando?: boolean
  children: ReactNode
}

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

const VARIANTES: Record<Variante, string> = {
  primario: 'bg-sky-600 px-4 py-2.5 text-white hover:bg-sky-700 focus-visible:outline-sky-600',
  secundario:
    'border border-slate-300 bg-white px-4 py-2.5 text-slate-700 hover:bg-slate-100 ' +
    'focus-visible:outline-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
  fantasma:
    'px-3 py-2 text-slate-600 hover:bg-slate-200/70 focus-visible:outline-slate-400 ' +
    'dark:text-slate-300 dark:hover:bg-slate-800',
  peligro:
    'px-3 py-2 text-red-600 hover:bg-red-100 focus-visible:outline-red-500 ' +
    'dark:text-red-400 dark:hover:bg-red-950/50',
}

export function Button({ variante = 'primario', cargando = false, children, className, disabled, ...resto }: Props) {
  return (
    <button {...resto} disabled={disabled === true || cargando} className={cn(BASE, VARIANTES[variante], className)}>
      {cargando && <Spinner />}
      {children}
    </button>
  )
}
