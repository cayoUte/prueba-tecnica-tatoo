import { CitySearch } from '../components/CitySearch'
import { EmptyState } from '../components/EmptyState'
import { Layout } from '../components/Layout'
import { WeatherTable } from '../components/WeatherTable'
import { WeatherTableSkeleton } from '../components/WeatherTableSkeleton'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { useWeather } from '../hooks/useWeather'

export function DashboardPage() {
  const {
    climas,
    cargando,
    error,
    consultando,
    eliminandoId,
    recargar,
    buscarCiudad,
    eliminar,
    comentar,
    borrarComentario,
  } = useWeather()

  return (
    <Layout>
      <div className="space-y-5">
        <CitySearch onBuscar={buscarCiudad} consultando={consultando} />

        {error !== null && (
          <Alert>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>{error}</span>
              <Button variante="secundario" onClick={() => void recargar()} className="text-xs">
                Reintentar
              </Button>
            </div>
          </Alert>
        )}

        {/* Los tres estados del historial: cargando, vacio y con datos. */}
        {cargando ? (
          <WeatherTableSkeleton />
        ) : climas.length === 0 ? (
          <EmptyState />
        ) : (
          <WeatherTable
            climas={climas}
            eliminandoId={eliminandoId}
            onEliminar={eliminar}
            onComentar={comentar}
            onEliminarComentario={borrarComentario}
          />
        )}
      </div>
    </Layout>
  )
}
