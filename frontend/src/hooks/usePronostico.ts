import { useEffect, useState } from 'react'
import { pronosticoDe } from '../services/climas'
import type { HoraPronostico } from '../types/api'

/**
 * Pronostico de la consulta seleccionada. Devuelve solo futuro: el backend
 * lo pide a OpenWeatherMap, que en el plan gratuito no entrega horas pasadas.
 * Las pasadas las arma el dashboard con el historial ya guardado.
 *
 * El estado guarda de que consulta son las horas, y `cargando` se deriva de
 * ahi. Asi el efecto no toca el estado de forma sincrona, que es lo que
 * provoca un render en cascada, y ademas no quedan horas de la ciudad
 * anterior visibles mientras llega la nueva respuesta.
 */
export function usePronostico(climaId: number | null) {
  const [datos, setDatos] = useState<{ id: number; horas: HoraPronostico[] } | null>(null)

  useEffect(() => {
    if (climaId === null) return

    let vigente = true

    pronosticoDe(climaId)
      .then((horas) => {
        if (vigente) setDatos({ id: climaId, horas })
      })
      .catch(() => {
        // El pronostico es informacion extra: si falla, el resto de la
        // columna sigue siendo util, asi que no se propaga el error.
        if (vigente) setDatos({ id: climaId, horas: [] })
      })

    // Si cambia la seleccion antes de que llegue la respuesta, no pisamos
    // el estado con el pronostico de la ciudad anterior.
    return () => {
      vigente = false
    }
  }, [climaId])

  const listo = datos !== null && datos.id === climaId

  return {
    horas: listo ? datos.horas : [],
    cargando: climaId !== null && !listo,
  }
}
