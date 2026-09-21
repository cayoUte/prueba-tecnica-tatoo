import { useCallback, useEffect, useState } from 'react'
import { toApiError } from '../lib/http'
import { consultarCiudad, eliminarClima, listarClimas } from '../services/climas'
import { comentarClima, eliminarComentario } from '../services/comentarios'
import type { ApiError, Clima } from '../types/api'

/**
 * Unico punto del frontend que orquesta las llamadas de clima y comentarios.
 * Los componentes no importan axios ni los servicios: piden cosas a este hook.
 *
 * Las mutaciones devuelven `null` si salieron bien, o el ApiError si fallaron,
 * para que cada formulario decida como mostrar su propio error.
 */
export function useWeather() {
  const [climas, setClimas] = useState<Clima[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [consultando, setConsultando] = useState(false)
  const [eliminandoId, setEliminandoId] = useState<number | null>(null)

  // La carga inicial vive dentro del efecto y pone el estado desde los
  // callbacks de la promesa, no en el cuerpo del efecto: asi no hay renders
  // en cascada. `cargando` ya arranca en true, por eso no hay que encenderlo.
  useEffect(() => {
    let vigente = true

    listarClimas()
      .then((lista) => {
        if (!vigente) return
        setClimas(lista)
        setError(null)
      })
      .catch((fallo: unknown) => {
        if (vigente) setError(toApiError(fallo).message)
      })
      .finally(() => {
        if (vigente) setCargando(false)
      })

    // Si el componente se desmonta antes de que llegue la respuesta, no
    // tocamos el estado de algo que ya no esta en pantalla.
    return () => {
      vigente = false
    }
  }, [])

  /** Reintento manual: es un manejador de evento, aqui si podemos marcar carga. */
  const recargar = useCallback(async (): Promise<void> => {
    setCargando(true)
    setError(null)

    try {
      setClimas(await listarClimas())
    } catch (fallo) {
      setError(toApiError(fallo).message)
    } finally {
      setCargando(false)
    }
  }, [])

  const buscarCiudad = useCallback(async (ciudad: string): Promise<ApiError | null> => {
    setConsultando(true)

    try {
      const nueva = await consultarCiudad(ciudad)
      setClimas((previas) => [nueva, ...previas])
      return null
    } catch (fallo) {
      return toApiError(fallo)
    } finally {
      setConsultando(false)
    }
  }, [])

  const eliminar = useCallback(async (id: number): Promise<ApiError | null> => {
    setEliminandoId(id)

    try {
      await eliminarClima(id)
      setClimas((previas) => previas.filter((clima) => clima.id !== id))
      return null
    } catch (fallo) {
      const apiError = toApiError(fallo)
      setError(apiError.message)
      return apiError
    } finally {
      setEliminandoId(null)
    }
  }, [])

  const comentar = useCallback(
    async (climaId: number, contenido: string): Promise<ApiError | null> => {
      try {
        const comentario = await comentarClima(climaId, contenido)

        setClimas((previas) =>
          previas.map((clima) =>
            clima.id === climaId
              ? { ...clima, comentarios: [...(clima.comentarios ?? []), comentario] }
              : clima,
          ),
        )

        return null
      } catch (fallo) {
        return toApiError(fallo)
      }
    },
    [],
  )

  const borrarComentario = useCallback(
    async (climaId: number, comentarioId: number): Promise<ApiError | null> => {
      try {
        await eliminarComentario(comentarioId)

        setClimas((previas) =>
          previas.map((clima) =>
            clima.id === climaId
              ? {
                  ...clima,
                  comentarios: (clima.comentarios ?? []).filter((c) => c.id !== comentarioId),
                }
              : clima,
          ),
        )

        return null
      } catch (fallo) {
        return toApiError(fallo)
      }
    },
    [],
  )

  return {
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
  }
}
