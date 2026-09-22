import { motion } from 'framer-motion'
import type { ApiError, Clima } from '../types/api'
import { tipoDeCondicion } from '../utils/clima'
import { cn } from '../utils/cn'
import { capitalizar, grados } from '../utils/formato'
import { WeatherIcon } from './WeatherIcon'
import { Spinner } from './ui/Spinner'

function IconoBasura() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
      <path
        d="M3.5 5.5h13M8 5.5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M5 5.5l.8 10a1.5 1.5 0 0 0 1.5 1.4h5.4a1.5 1.5 0 0 0 1.5-1.4l.8-10M8.5 9v5M11.5 9v5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface Props {
  clima: Clima
  seleccionado: boolean
  onSeleccionar: (clima: Clima) => void
  eliminando: boolean
  onEliminar: (id: number) => Promise<ApiError | null>
}

/**
 * Tarjeta del historial, con la forma del diseno: temperatura grande arriba a
 * la izquierda, minima y maxima debajo, ciudad al pie y el icono sobresaliendo
 * por el corte diagonal de la esquina superior derecha.
 *
 * El boton que cubre la tarjeta es el que selecciona; el de eliminar va por
 * encima en el orden de apilado para que no quede uno dentro del otro, que
 * es HTML invalido y rompe la navegacion por teclado.
 */
export function WeatherCard({ clima, seleccionado, onSeleccionar, eliminando, onEliminar }: Props) {
  // Las consultas guardadas antes de que se registraran minima y maxima no
  // las traen: en ese caso la linea no se dibuja en vez de dejar un hueco.
  const tieneRango = clima.temp_min != null && clima.temp_max != null

  return (
    // El padding superior reserva el espacio por el que asoma el icono.
    <motion.li
      layout
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className="relative pt-8"
    >
      <div
        className={cn(
          'tarjeta-clima rounded-tarjeta relative min-h-[130px] px-5 pt-5 pb-4 transition',
          seleccionado ? 'brightness-115' : 'hover:brightness-110',
        )}
      >
        <button
          type="button"
          onClick={() => onSeleccionar(clima)}
          aria-pressed={seleccionado}
          className="absolute inset-0 z-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento-rosa"
        >
          <span className="sr-only">Ver el detalle de {clima.ciudad}</span>
        </button>

        <div className="pointer-events-none relative z-10">
          <p className="text-5xl leading-none font-light tracking-tight tabular-nums">
            {grados(clima.temperatura)}
          </p>

          {tieneRango && (
            <p className="mt-4 text-[10px] text-white/55 tabular-nums">
              H:{grados(clima.temp_max as number)} L:{grados(clima.temp_min as number)}
            </p>
          )}

          <p className={cn('truncate pr-24 text-sm font-medium', tieneRango ? 'mt-0.5' : 'mt-4')}>
            {clima.ciudad}
          </p>
        </div>

        {/* La condicion va abajo a la derecha, como en el diseno. El hueco de
            la derecha lo ocupa el boton de eliminar. */}
        <p className="pointer-events-none absolute right-12 bottom-4 z-10 max-w-28 truncate text-[10px] font-medium text-white/85">
          {capitalizar(clima.condicion_clima)}
        </p>
      </div>

      {/* Fuera de la tarjeta para que el recorte diagonal no lo corte. */}
      <WeatherIcon
        tipo={tipoDeCondicion(clima.condicion_clima)}
        className="pointer-events-none absolute top-0 right-4 z-10 size-28"
      />

      <button
        type="button"
        onClick={() => void onEliminar(clima.id)}
        disabled={eliminando}
        aria-label={`Eliminar la consulta de ${clima.ciudad}`}
        title="Eliminar consulta"
        className="absolute right-3 bottom-3 z-20 inline-flex size-8 items-center justify-center rounded-full text-white/60 transition hover:bg-rose-400/20 hover:text-rose-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento-rosa disabled:opacity-60"
      >
        {eliminando ? <Spinner /> : <IconoBasura />}
      </button>
    </motion.li>
  )
}
