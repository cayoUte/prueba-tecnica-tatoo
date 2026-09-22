import { useId } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  etiqueta: string
  error?: string
}

/**
 * La misma escala compacta que TextField: etiqueta y texto de 10px, radio de
 * 6px y 4px entre la etiqueta y el campo. Lo unico que cambia es que aqui la
 * altura la fijan las filas, no un `h-*`.
 */
export function TextArea({ etiqueta, error, className, ...resto }: Props) {
  const id = useId()
  const idError = `${id}-error`
  const tieneError = error !== undefined

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[10px] text-acento-lila/90">
        {etiqueta}
      </label>

      <textarea
        {...resto}
        id={id}
        aria-invalid={tieneError || undefined}
        aria-describedby={tieneError ? idError : undefined}
        className={cn(
          'w-full resize-y rounded-md border bg-noche-950/40 px-3 py-2 text-[10px] text-white transition',
          'placeholder:text-acento-lila/45 focus:outline-[0.5px] focus:outline-offset-0',
          tieneError
            ? 'border-rose-400/70 focus:outline-rose-400'
            : 'border-white/15 focus:border-transparent focus:outline-acento-rosa/80',
          className,
        )}
      />

      {tieneError && (
        <p id={idError} className="mt-1 text-[9px] text-rose-300">
          {error}
        </p>
      )}
    </div>
  )
}
