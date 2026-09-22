import { useState } from 'react'
import { CitySearch } from '../components/CitySearch'
import { EmptyState } from '../components/EmptyState'
import { Layout } from '../components/Layout'
import { WeatherDetail } from '../components/WeatherDetail'
import { WeatherList } from '../components/WeatherList'
import { WeatherListSkeleton } from '../components/WeatherListSkeleton'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { useWeather } from '../hooks/useWeather'
import { cn } from '../utils/cn'

type Pestana = 'historial' | 'consulta'

const PESTANAS: { valor: Pestana; texto: string }[] = [
  { valor: 'historial', texto: 'Historial' },
  { valor: 'consulta', texto: 'Consulta' },
]

export function DashboardPage() {
  const { estado, recargar, buscarCiudad, eliminar, comentar, borrarComentario } = useWeather()
  const { climas, carga, consultando, eliminandoId } = estado

  // Que consulta se ve en el detalle. Se guarda el id y no el objeto para
  // que al comentar se lea siempre la version fresca del historial, no una
  // copia congelada. `null` significa "la mas reciente".
  const [elegidoId, setElegidoId] = useState<number | null>(null)

  // Solo se usa por debajo de lg, donde no caben las dos columnas.
  const [pestana, setPestana] = useState<Pestana>('historial')

  // La seleccion se deriva en el render en vez de sincronizarse con un
  // efecto: si la elegida se elimina, esto cae solo sobre la mas reciente.
  const seleccionado = climas.find((clima) => clima.id === elegidoId) ?? climas[0] ?? null

  // Tras una busqueda exitosa volvemos a "la mas reciente", que es justo la
  // consulta recien creada. En movil ademas saltamos a su pestana, porque si
  // no el resultado de la busqueda quedaria en una pestana que no se ve.
  async function buscar(ciudad: string) {
    const fallo = await buscarCiudad(ciudad)

    if (fallo === null) {
      setElegidoId(null)
      setPestana('consulta')
    }

    return fallo
  }

  function elegir(id: number) {
    setElegidoId(id)
    setPestana('consulta')
  }

  return (
    <Layout busqueda={<CitySearch onBuscar={buscar} consultando={consultando} />}>
      <div className="flex h-full min-h-0 flex-col">
        {/* Pestanas: solo cuando no caben las dos columnas. */}
        <div className="shrink-0 px-4 pt-4 lg:hidden" role="tablist" aria-label="Vistas">
          <div className="mx-auto flex max-w-xl gap-1 rounded-full border border-white/10 bg-noche-950/40 p-1">
            {PESTANAS.map(({ valor, texto }) => (
              <button
                key={valor}
                type="button"
                role="tab"
                aria-selected={pestana === valor}
                onClick={() => setPestana(valor)}
                className={cn(
                  'flex-1 rounded-full px-3 py-1.5 text-[10px] font-medium transition',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento-rosa',
                  pestana === valor ? 'degradado-acento text-white' : 'text-acento-lila/70 hover:text-white',
                )}
              >
                {texto}
              </button>
            ))}
          </div>
        </div>

        {/*
          En escritorio son dos paneles a sangre, sin separacion ni bordes: lo
          unico que los distingue es su color de fondo. La proporcion aurea
          (1 : 1.618) deja el detalle mas ancho que el historial.
        */}
        <div className="min-h-0 flex-1 lg:grid lg:grid-cols-[1fr_1.618fr]">
          <section
            aria-label="Historial de consultas"
            className={cn(
              'min-h-0 min-w-0 flex-col p-4 lg:flex lg:bg-noche-950/20 lg:p-6',
              pestana === 'historial' ? 'flex' : 'hidden',
            )}
          >
            {carga.estado === 'fallo' && (
              <div className="mx-auto mb-3 w-full max-w-xl shrink-0 lg:max-w-none">
                <Alert>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span>{carga.mensaje}</span>
                    <Button variante="secundario" texto="xs" onClick={() => void recargar()}>
                      Reintentar
                    </Button>
                  </div>
                </Alert>
              </div>
            )}

            {/* En modo pestanas la columna ocupa todo el ancho, asi que se
                limita para que las tarjetas no salgan estiradas. */}
            <div className="barra-fina mx-auto min-h-0 w-full max-w-xl flex-1 overflow-y-auto pr-2 lg:max-w-none">
              {carga.estado === 'cargando' ? (
                <WeatherListSkeleton />
              ) : climas.length === 0 ? (
                <EmptyState />
              ) : (
                <WeatherList
                  climas={climas}
                  seleccionadoId={seleccionado?.id ?? null}
                  onSeleccionar={(clima) => elegir(clima.id)}
                  eliminandoId={eliminandoId}
                  onEliminar={eliminar}
                />
              )}
            </div>
          </section>

          <section
            aria-label="Detalle de la consulta"
            className={cn(
              'mx-auto min-h-0 w-full max-w-xl min-w-0 p-4 lg:max-w-none lg:block lg:bg-noche-950/55 lg:p-0',
              pestana === 'consulta' ? 'block' : 'hidden',
            )}
          >
            <WeatherDetail
              clima={seleccionado}
              historial={climas}
              cargando={carga.estado === 'cargando'}
              onComentar={comentar}
              onEliminarComentario={borrarComentario}
            />
          </section>
        </div>
      </div>
    </Layout>
  )
}
