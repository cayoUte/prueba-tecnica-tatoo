import { useContext } from 'react'
import { ClimaContext } from '../context/clima-context'
import type { ValorDeClima } from '../context/clima-context'

export function useWeather(): ValorDeClima {
  const contexto = useContext(ClimaContext)

  if (contexto === null) {
    throw new Error('useWeather solo puede usarse dentro de <ClimaProvider>.')
  }

  return contexto
}
