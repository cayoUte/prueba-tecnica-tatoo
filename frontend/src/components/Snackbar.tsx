import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { Snack, TonoSnack } from '../context/snackbar-context'
import { cn } from '../utils/cn'

const TONOS: Record<TonoSnack, string> = {
  exito: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-100',
  error: 'border-rose-400/40 bg-rose-500/15 text-rose-100',
  aviso: 'border-amber-400/40 bg-amber-500/15 text-amber-100',
}

function Icono({ tono }: { tono: TonoSnack }) {
  const trazo = { stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

  return (
    <svg viewBox="0 0 20 20" fill="none" className="mt-px size-4 shrink-0" aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" {...trazo} />
      {tono === 'exito' && <path d="m6.8 10.2 2.2 2.2 4.2-4.6" {...trazo} />}
      {tono === 'error' && <path d="m7.5 7.5 5 5m0-5-5 5" {...trazo} />}
      {tono === 'aviso' && <path d="M10 6.3v4.4m0 2.6v.2" {...trazo} />}
    </svg>
  )
}

interface Props {
  snacks: Snack[]
  onCerrar: (id: number) => void
}

/**
 * Pila de mensajes en la esquina superior derecha. Entran deslizandose desde
 * el borde de la pantalla y salen por el mismo sitio.
 *
 * El contenedor es `pointer-events-none` para no tapar la interfaz que hay
 * debajo; cada mensaje vuelve a activarlos para que su boton de cerrar y su
 * texto sigan siendo utilizables.
 */
export function Snackbar({ snacks, onCerrar }: Props) {
  // Framer Motion anima con JavaScript, asi que la regla de
  // `prefers-reduced-motion` del CSS no le afecta: hay que consultarla aqui.
  const menosMovimiento = useReducedMotion()

  const desplazado = menosMovimiento ? { opacity: 0 } : { opacity: 0, x: 'calc(100% + 1rem)' }

  return (
    <div
      // `aria-live` va en el contenedor, que existe desde el principio: si se
      // montara junto al mensaje, el lector de pantalla no anunciaria nada.
      aria-live="polite"
      aria-relevant="additions"
      className="pointer-events-none fixed top-3 right-3 z-50 flex w-[min(20rem,calc(100vw-1.5rem))] flex-col gap-2"
    >
      <AnimatePresence initial={false}>
        {snacks.map((snack) => (
          <motion.div
            key={snack.id}
            layout
            initial={desplazado}
            animate={{ opacity: 1, x: 0 }}
            exit={desplazado}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            className={cn(
              'pointer-events-auto flex items-start gap-2 rounded-md border px-3 py-2 shadow-tarjeta backdrop-blur',
              TONOS[snack.tono],
            )}
          >
            <Icono tono={snack.tono} />

            <p className="min-w-0 flex-1 text-[10px] leading-relaxed break-words">{snack.mensaje}</p>

            <button
              type="button"
              onClick={() => onCerrar(snack.id)}
              aria-label="Cerrar el mensaje"
              className="-mr-1 shrink-0 rounded px-1 text-current/70 transition hover:text-current focus-visible:outline-[0.5px] focus-visible:outline-current"
            >
              <svg viewBox="0 0 20 20" fill="none" className="size-3.5" aria-hidden="true">
                <path d="m6 6 8 8m0-8-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
