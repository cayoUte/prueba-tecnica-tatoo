import type { Clima, HoraPronostico } from '../types/api'
import { tipoDeCondicion } from '../utils/clima'
import { cn } from '../utils/cn'
import { formatearHora, grados } from '../utils/formato'
import { WeatherIcon } from './WeatherIcon'

/** Una franja ya normalizada, venga del historial o del pronostico. */
interface Franja {
  clave: string
  etiqueta: string
  temperatura: number
  condicion: string
  esAhora: boolean
}

interface Props {
  /** La consulta seleccionada: es el "Ahora" del slider. */
  clima: Clima
  /** Historial completo, para sacar las lecturas pasadas de esta ciudad. */
  historial: readonly Clima[]
  futuro: HoraPronostico[]
  cargando: boolean
}

/** Cuantas lecturas pasadas de la misma ciudad se muestran antes de "Ahora". */
const MAXIMO_PASADAS = 6

function construirFranjas(
  clima: Clima,
  historial: readonly Clima[],
  futuro: readonly HoraPronostico[],
): Franja[] {
  // El pasado son consultas reales de la misma ciudad, anteriores a esta.
  // Son irregulares a proposito: solo hay lectura cuando alguien busco.
  const pasadas = historial
    .filter(
      (otro) =>
        otro.id !== clima.id &&
        otro.ciudad === clima.ciudad &&
        otro.fecha_consulta < clima.fecha_consulta,
    )
    .slice(0, MAXIMO_PASADAS)
    .reverse()
    .map<Franja>((otro) => ({
      clave: `pasada-${otro.id}`,
      etiqueta: formatearHora(otro.fecha_consulta),
      temperatura: otro.temperatura,
      condicion: otro.condicion_clima,
      esAhora: false,
    }))

  const ahora: Franja = {
    clave: 'ahora',
    etiqueta: 'Ahora',
    temperatura: clima.temperatura,
    condicion: clima.condicion_clima,
    esAhora: true,
  }

  const proximas = futuro.map<Franja>((hora) => ({
    clave: `futura-${hora.hora}`,
    etiqueta: formatearHora(hora.hora),
    temperatura: hora.temperatura,
    condicion: hora.condicion_clima,
    esAhora: false,
  }))

  return [...pasadas, ahora, ...proximas]
}

export function HourlyForecast({ clima, historial, futuro, cargando }: Props) {
  const franjas = construirFranjas(clima, historial, futuro)

  return (
    <section aria-label="Pronostico por horas">
      <h3 className="mb-2 text-[10px] font-semibold tracking-wider text-acento-lila/60 uppercase">
        Por horas
      </h3>

      {/* Scroll horizontal: es el unico eje que se mueve en esta columna. */}
      <ul className="barra-fina -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
        {franjas.map((franja) => (
          <li
            key={franja.clave}
            className={cn(
              'flex w-16 shrink-0 flex-col items-center gap-1 rounded-full border px-2 py-3 transition',
              franja.esAhora
                ? 'border-white/25 bg-noche-400/70 shadow-[0_8px_20px_-12px_rgba(0,0,0,0.8)]'
                : 'border-white/10 bg-noche-950/30',
            )}
            aria-current={franja.esAhora ? 'true' : undefined}
          >
            <span className="text-[10px] font-medium whitespace-nowrap text-acento-lila/80">
              {franja.etiqueta}
            </span>
            <WeatherIcon tipo={tipoDeCondicion(franja.condicion)} className="size-8" />
            <span className="text-sm font-medium tabular-nums">{grados(franja.temperatura)}</span>
          </li>
        ))}

        {cargando &&
          [0, 1, 2].map((n) => (
            <li
              key={`carga-${n}`}
              aria-hidden="true"
              className="h-[86px] w-16 shrink-0 animate-pulse rounded-full bg-white/10"
            />
          ))}
      </ul>

      {!cargando && futuro.length === 0 && (
        <p className="text-[10px] text-acento-lila/50">
          El pronostico no esta disponible ahora mismo.
        </p>
      )}
    </section>
  )
}
