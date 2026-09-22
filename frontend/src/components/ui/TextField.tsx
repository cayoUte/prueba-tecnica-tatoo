import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string
  error?: string
  ayuda?: string
  /** Icono decorativo a la izquierda del texto, como la lupa del buscador. */
  icono?: ReactNode
  /** Oculta la etiqueta visualmente (sigue existiendo para lectores de pantalla). */
  etiquetaOculta?: boolean
}

/**
 * Escala compacta de los formularios: etiqueta y campo de 10px, alto de 30px,
 * radio de 6px y 4px entre la etiqueta y el campo.
 *
 * Cada medida se declara una sola vez. Dos utilidades del mismo grupo en la
 * misma clase (`text-[10px]` y `text-xs`, por ejemplo) no se resuelven por el
 * orden en que se escriben, sino por el orden en que Tailwind las emite en la
 * hoja, asi que el resultado deja de ser predecible.
 */
export function TextField({ etiqueta, error, ayuda, icono, etiquetaOculta = false, className, ...resto }: Props) {
  const id = useId()
  const idMensaje = `${id}-mensaje`
  const tieneError = error !== undefined

  return (
    <div>
      <label
        htmlFor={id}
        className={cn('mb-1 block text-[10px] text-acento-lila/90', etiquetaOculta && 'sr-only')}
      >
        {etiqueta}
      </label>

      <div className="relative">
        {icono !== undefined && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-acento-lila/60"
          >
            {icono}
          </span>
        )}

        <input
          {...resto}
          id={id}
          aria-invalid={tieneError || undefined}
          aria-describedby={tieneError || ayuda !== undefined ? idMensaje : undefined}
          className={cn(
            'h-[30px] w-full rounded-md border bg-noche-950/40 px-3 text-[10px] text-white transition',
            'placeholder:text-acento-lila/45 focus:outline-[0.5px] focus:outline-offset-0',
            icono !== undefined && 'pl-9',
            tieneError
              ? 'border-acento-magenta/70 focus:outline-acento-magenta'
              : 'border-white/15 focus:border-transparent focus:outline-acento-rosa/80',
            className,
          )}
        />
      </div>

      {tieneError ? (
        <p id={idMensaje} className="mt-1 text-[9px] text-acento-magenta">
          {error}
        </p>
      ) : ayuda !== undefined ? (
        <p id={idMensaje} className="mt-1 text-[9px] text-acento-lila/60">
          {ayuda}
        </p>
      ) : null}
    </div>
  )
}
