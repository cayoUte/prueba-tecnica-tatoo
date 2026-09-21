import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string
  error?: string
  ayuda?: string
}

export function TextField({ etiqueta, error, ayuda, className, ...resto }: Props) {
  const id = useId()
  const idMensaje = `${id}-mensaje`
  const tieneError = error !== undefined

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {etiqueta}
      </label>

      <input
        {...resto}
        id={id}
        aria-invalid={tieneError || undefined}
        aria-describedby={tieneError || ayuda !== undefined ? idMensaje : undefined}
        className={cn(
          'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-xs transition-colors',
          'placeholder:text-slate-400 focus:outline-2 focus:outline-offset-0',
          'dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500',
          tieneError
            ? 'border-red-400 focus:outline-red-500 dark:border-red-500/70'
            : 'border-slate-300 focus:outline-sky-600 dark:border-slate-700',
          className,
        )}
      />

      {tieneError ? (
        <p id={idMensaje} className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : ayuda !== undefined ? (
        <p id={idMensaje} className="text-sm text-slate-500 dark:text-slate-400">
          {ayuda}
        </p>
      ) : null}
    </div>
  )
}
