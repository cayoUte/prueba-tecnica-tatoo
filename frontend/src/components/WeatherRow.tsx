import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import type { ReactNode } from 'react'
import type { ApiError, Clima } from '../types/api'
import { cn } from '../utils/cn'
import { REJILLA_CLIMA } from '../utils/estilos'
import { capitalizar, formatearFecha, formatearTemperatura } from '../utils/formato'
import { CommentSection } from './CommentSection'
import { Button } from './ui/Button'

/** Muestra la etiqueta de la columna solo en movil, donde no hay cabecera. */
function Celda({
  etiqueta,
  children,
  className,
}: {
  etiqueta?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('min-w-0', className)}>
      {etiqueta !== undefined && (
        <span className="mb-0.5 block text-[11px] font-medium tracking-wide text-slate-400 uppercase md:hidden dark:text-slate-500">
          {etiqueta}
        </span>
      )}
      {children}
    </div>
  )
}

interface Props {
  clima: Clima
  eliminando: boolean
  onEliminar: (id: number) => Promise<ApiError | null>
  onComentar: (climaId: number, contenido: string) => Promise<ApiError | null>
  onEliminarComentario: (climaId: number, comentarioId: number) => Promise<ApiError | null>
}

export function WeatherRow({ clima, eliminando, onEliminar, onComentar, onEliminarComentario }: Props) {
  const [abierto, setAbierto] = useState(false)
  const comentarios = clima.comentarios ?? []

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.18 }}
      className="border-b border-slate-200 px-4 py-4 last:border-b-0 md:py-3 dark:border-slate-800"
    >
      <div className={cn('grid', REJILLA_CLIMA)}>
        <Celda etiqueta="Ciudad">
          <p className="truncate font-medium text-slate-900 dark:text-slate-100">{clima.ciudad}</p>
        </Celda>

        <Celda etiqueta="Temperatura">
          <p className="tabular-nums text-slate-700 dark:text-slate-300">
            {formatearTemperatura(clima.temperatura, clima.temp_fahrenheit)}
          </p>
        </Celda>

        <Celda etiqueta="Humedad">
          <p className="tabular-nums text-slate-700 dark:text-slate-300">{clima.humedad}%</p>
        </Celda>

        <Celda etiqueta="Condicion">
          <p className="truncate text-slate-700 dark:text-slate-300">{capitalizar(clima.condicion_clima)}</p>
        </Celda>

        <Celda etiqueta="Consultada">
          <p className="text-slate-500 dark:text-slate-400">{formatearFecha(clima.fecha_consulta)}</p>
        </Celda>

        <Celda className="col-span-2 flex items-center gap-1 md:col-span-1 md:justify-end">
          <Button
            variante="fantasma"
            onClick={() => setAbierto((previo) => !previo)}
            aria-expanded={abierto}
            className="text-xs"
          >
            {comentarios.length === 1 ? '1 comentario' : `${comentarios.length} comentarios`}
          </Button>

          <Button
            variante="peligro"
            onClick={() => void onEliminar(clima.id)}
            cargando={eliminando}
            aria-label={`Eliminar la consulta de ${clima.ciudad}`}
            className="text-xs"
          >
            Eliminar
          </Button>
        </Celda>
      </div>

      <AnimatePresence initial={false}>
        {abierto && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <CommentSection
              comentarios={comentarios}
              onComentar={(contenido) => onComentar(clima.id, contenido)}
              onEliminar={(comentarioId) => onEliminarComentario(clima.id, comentarioId)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  )
}
