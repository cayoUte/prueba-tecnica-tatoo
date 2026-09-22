function Barra({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-full bg-white/15 ${className}`} />
}

const TARJETAS = [0, 1, 2]

/**
 * Placeholder con la forma de las tarjetas. Se prefiere a un spinner porque no
 * desplaza el contenido cuando llegan los datos: el hueco ya estaba ahi.
 */
export function WeatherListSkeleton() {
  return (
    <section aria-busy="true" className="space-y-4">
      <Barra className="h-4 w-32" />

      <ul className="space-y-4">
        {TARJETAS.map((tarjeta) => (
          <li key={tarjeta} className="tarjeta-clima rounded-tarjeta flex justify-between p-5 opacity-70">
            <div className="space-y-3">
              <Barra className="h-14 w-24 rounded-2xl" />
              <Barra className="h-3 w-32" />
              <Barra className="h-4 w-24" />
            </div>
            <div className="size-20 animate-pulse rounded-full bg-white/10" />
          </li>
        ))}
      </ul>

      <p className="sr-only" role="status">
        Cargando el historial de consultas
      </p>
    </section>
  )
}
