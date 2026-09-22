import { AnimatePresence } from 'framer-motion'
import type { ApiError, Clima } from '../types/api'
import { WeatherCard } from './WeatherCard'

interface Props {
  climas: readonly Clima[]
  seleccionadoId: number | null
  onSeleccionar: (clima: Clima) => void
  eliminandoId: number | null
  onEliminar: (id: number) => Promise<ApiError | null>
}

export function WeatherList({ climas, seleccionadoId, onSeleccionar, eliminandoId, onEliminar }: Props) {
  return (
    <ul className="space-y-4">
      <AnimatePresence initial={false}>
        {climas.map((clima) => (
          <WeatherCard
            key={clima.id}
            clima={clima}
            seleccionado={seleccionadoId === clima.id}
            onSeleccionar={onSeleccionar}
            eliminando={eliminandoId === clima.id}
            onEliminar={onEliminar}
          />
        ))}
      </AnimatePresence>
    </ul>
  )
}
