import { WeatherIcon } from './WeatherIcon'

export function EmptyState() {
  return (
    <section className="vidrio rounded-tarjeta px-6 py-10 text-center">
      <WeatherIcon tipo="nubes" className="mx-auto size-20 opacity-80" />
      <p className="mt-2 text-base font-medium">Todavia no hay consultas</p>
      <p className="mt-1 text-sm text-acento-lila/65">
        Busca una ciudad arriba y apareceran aqui su temperatura y sus comentarios.
      </p>
    </section>
  )
}
