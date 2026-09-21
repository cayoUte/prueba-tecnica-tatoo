import { AnimatePresence } from 'framer-motion'
import type { ApiError, Clima } from '../types/api'
import { cn } from '../utils/cn'
import { REJILLA_CLIMA } from '../utils/estilos'
import { WeatherRow } from './WeatherRow'

interface Props {
  climas: Clima[]
  eliminandoId: number | null
  onEliminar: (id: number) => Promise<ApiError | null>
  onComentar: (climaId: number, contenido: string) => Promise<ApiError | null>
  onEliminarComentario: (climaId: number, comentarioId: number) => Promise<ApiError | null>
}

export function WeatherTable({ climas, eliminandoId, onEliminar, onComentar, onEliminarComentario }: Props) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Historial de consultas</h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {climas.length === 1 ? '1 consulta guardada' : `${climas.length} consultas guardadas`}
        </p>
      </header>

      {/* La cabecera de columnas solo aparece cuando hay columnas de verdad. */}
      <div
        className={cn(
          'hidden md:grid',
          REJILLA_CLIMA,
          'border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-medium tracking-wide text-slate-500 uppercase dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400',
        )}
      >
        <span>Ciudad</span>
        <span>Temperatura</span>
        <span>Humedad</span>
        <span>Condicion</span>
        <span>Consultada</span>
        <span className="sr-only">Acciones</span>
      </div>

      <ul className="text-sm">
        <AnimatePresence initial={false}>
          {climas.map((clima) => (
            <WeatherRow
              key={clima.id}
              clima={clima}
              eliminando={eliminandoId === clima.id}
              onEliminar={onEliminar}
              onComentar={onComentar}
              onEliminarComentario={onEliminarComentario}
            />
          ))}
        </AnimatePresence>
      </ul>
    </section>
  )
}
