import { cn } from '../utils/cn'
import { REJILLA_CLIMA } from '../utils/estilos'

function Barra({ className }: { className: string }) {
  return <div className={cn('h-4 animate-pulse rounded bg-slate-200 dark:bg-slate-800', className)} />
}

const FILAS = [0, 1, 2, 3]

/**
 * Placeholder con la forma de la tabla. Se prefiere a un spinner porque no
 * desplaza el contenido cuando llegan los datos: el hueco ya estaba ahi.
 */
export function WeatherTableSkeleton() {
  return (
    <section
      aria-busy="true"
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <header className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <Barra className="w-40" />
      </header>

      <ul>
        {FILAS.map((fila) => (
          <li
            key={fila}
            className={cn(
              'grid',
              REJILLA_CLIMA,
              'border-b border-slate-200 px-4 py-4 last:border-b-0 md:py-4 dark:border-slate-800',
            )}
          >
            <Barra className="w-24" />
            <Barra className="w-28" />
            <Barra className="w-12" />
            <Barra className="w-24" />
            <Barra className="w-20" />
            <Barra className="w-16" />
          </li>
        ))}
      </ul>

      <p className="sr-only" role="status">
        Cargando el historial de consultas
      </p>
    </section>
  )
}
