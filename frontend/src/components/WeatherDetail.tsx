import type { ReactNode } from 'react'
import { usePronostico } from '../hooks/usePronostico'
import type { ApiError, Clima } from '../types/api'
import { tipoDeCondicion } from '../utils/clima'
import { capitalizar, formatearFecha, grados } from '../utils/formato'
import { CommentSection } from './CommentSection'
import { HourlyForecast } from './HourlyForecast'
import { WeatherIcon } from './WeatherIcon'

function Widget({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-noche-950/30 px-3 py-2">
      <p className="text-[10px] font-semibold tracking-wider text-acento-lila/60 uppercase">{etiqueta}</p>
      <p className="mt-0.5 text-sm font-medium tabular-nums">{children}</p>
    </div>
  )
}

interface Props {
  /** La consulta que coincide con la busqueda, o null si no hay ninguna. */
  clima: Clima | null
  /** Historial completo: de ahi salen las horas pasadas del slider. */
  historial: readonly Clima[]
  cargando: boolean
  onComentar: (climaId: number, contenido: string) => Promise<ApiError | null>
  onEliminarComentario: (climaId: number, comentarioId: number) => Promise<ApiError | null>
}

/**
 * Columna derecha: el detalle de la consulta seleccionada, su pronostico por
 * horas y sus comentarios.
 *
 * Es una columna de altura fija; lo unico que crece sin limite son los
 * comentarios, asi que esa es la unica parte con scroll propio.
 */
export function WeatherDetail({ clima, historial, cargando, onComentar, onEliminarComentario }: Props) {
  const { horas, cargando: cargandoPronostico } = usePronostico(clima?.id ?? null)

  if (cargando) {
    return (
      <div className="vidrio-movil barra-fina h-full overflow-y-auto p-5 lg:p-6" aria-busy="true">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          <div className="mx-auto h-7 w-40 animate-pulse rounded-full bg-white/15" />
          <div className="mx-auto h-20 w-32 animate-pulse rounded-3xl bg-white/10" />
          <div className="h-[86px] animate-pulse rounded-3xl bg-white/10" />
        </div>
      </div>
    )
  }

  if (clima === null) {
    return (
      <div className="vidrio-movil flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
        <WeatherIcon tipo="nubes" className="size-20 opacity-80" />
        <p className="text-base font-medium">Sin consulta seleccionada</p>
        <p className="text-[10px] text-acento-lila/65">
          Busca una ciudad o elige una tarjeta del historial.
        </p>
      </div>
    )
  }

  return (
    // Sin borde ni radio en escritorio: ahi la columna ocupa la pantalla y se
    // distingue del historial solo por su color de fondo. `overflow-y-auto`
    // solo entra en juego si la pantalla es demasiado baja para el detalle
    // completo; en un escritorio normal no aparece barra.
    <div className="vidrio-movil barra-fina h-full min-h-0 overflow-y-auto p-5 lg:p-6">
      {/* 672px: el ancho util de esta columna es de 743px en una pantalla de
          1280 y crece desde ahi, asi que el tope se aplica desde un portatil
          normal hacia arriba y el contenido deja de estirarse. El scroll se
          queda en el contenedor de fuera para que la barra siga pegada al
          borde de la columna. */}
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <header className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-medium tracking-tight sm:text-2xl">{clima.ciudad}</h2>
            <p className="text-[10px] text-acento-lila/65">
              Consultada el {formatearFecha(clima.fecha_consulta)}
            </p>
            <p className="mt-2 text-5xl leading-none font-light tracking-tighter tabular-nums sm:text-6xl">
              {grados(clima.temperatura)}
            </p>
            <p className="mt-1 text-sm font-medium text-acento-lila/85">
              {capitalizar(clima.condicion_clima)}
            </p>
          </div>

          <WeatherIcon tipo={tipoDeCondicion(clima.condicion_clima)} className="size-20 shrink-0 sm:size-28" />
        </header>

        <div className="grid grid-cols-2 gap-2">
          <Widget etiqueta="Humedad">{clima.humedad}%</Widget>
          <Widget etiqueta="Fahrenheit">{grados(clima.temp_fahrenheit)}F</Widget>
        </div>

        <HourlyForecast
          clima={clima}
          historial={historial}
          futuro={horas}
          cargando={cargandoPronostico}
        />

        <CommentSection
          className="mb-1"
          comentarios={clima.comentarios ?? []}
          onComentar={(contenido) => onComentar(clima.id, contenido)}
          onEliminar={(comentarioId) => onEliminarComentario(clima.id, comentarioId)}
        />
      </div>
    </div>
  )
}
