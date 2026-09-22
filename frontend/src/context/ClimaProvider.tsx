import { useCallback, useEffect, useMemo, useReducer } from 'react'
import type { ReactNode } from 'react'
import { useSnackbar } from '../hooks/useSnackbar'
import { toApiError } from '../lib/http'
import { consultarCiudad, eliminarClima, listarClimas } from '../services/climas'
import { comentarClima, eliminarComentario } from '../services/comentarios'
import type { ApiError } from '../types/api'
import { ClimaContext, ESTADO_INICIAL } from './clima-context'
import type { ValorDeClima } from './clima-context'
import { climaReducer } from './clima-reducer'

/**
 * Unico punto del frontend que orquesta las llamadas de clima y comentarios.
 * Los componentes no importan axios ni los servicios: piden cosas al hook.
 *
 * El reducer decide como cambia el estado; aqui solo vive el `await` y el
 * aviso al usuario. Esa separacion es la razon de usar reducer: las
 * transiciones se leen de un tiron en `clima-reducer.ts`, sin promesas de
 * por medio.
 *
 * Todas las mutaciones avisan por el snackbar. Los errores de campo de un
 * 422 se quedan fuera a proposito: esos se pintan junto al campo que los
 * provoco, y repetirlos arriba seria decir dos veces lo mismo.
 */
export function ClimaProvider({ children }: { children: ReactNode }) {
  const { mostrar } = useSnackbar()
  const [estado, dispatch] = useReducer(climaReducer, ESTADO_INICIAL)

  // La carga inicial despacha desde los callbacks de la promesa y no en el
  // cuerpo del efecto: asi no hay renders en cascada. El estado ya arranca
  // en `cargando`, por eso no hace falta encenderlo.
  useEffect(() => {
    let vigente = true

    listarClimas()
      .then((climas) => {
        if (vigente) dispatch({ tipo: 'historial/recibido', climas })
      })
      .catch((fallo: unknown) => {
        if (vigente) dispatch({ tipo: 'historial/fallido', mensaje: toApiError(fallo).message })
      })

    // Si el provider se desmonta antes de que llegue la respuesta, no
    // tocamos el estado de algo que ya no esta en pantalla.
    return () => {
      vigente = false
    }
  }, [])

  /**
   * Avisa de un fallo, salvo que sea de validacion por campo: eso ya se
   * muestra en el propio formulario. Devuelve el error para no cortar la
   * cadena de `return`.
   */
  const avisarDelFallo = useCallback(
    (apiError: ApiError): ApiError => {
      if (Object.keys(apiError.errors).length === 0) mostrar(apiError.message, 'error')
      return apiError
    },
    [mostrar],
  )

  const recargar = useCallback(async (): Promise<void> => {
    dispatch({ tipo: 'historial/pedido' })

    try {
      dispatch({ tipo: 'historial/recibido', climas: await listarClimas() })
    } catch (fallo) {
      dispatch({ tipo: 'historial/fallido', mensaje: toApiError(fallo).message })
    }
  }, [])

  const buscarCiudad = useCallback(
    async (ciudad: string): Promise<ApiError | null> => {
      dispatch({ tipo: 'consulta/iniciada' })

      try {
        const clima = await consultarCiudad(ciudad)
        dispatch({ tipo: 'consulta/creada', clima })
        mostrar(`Clima de ${clima.ciudad} guardado.`, 'exito')
        return null
      } catch (fallo) {
        dispatch({ tipo: 'consulta/fallida' })
        // Aqui cae la ciudad inexistente (404) y el servicio caido (503).
        return avisarDelFallo(toApiError(fallo))
      }
    },
    [mostrar, avisarDelFallo],
  )

  const eliminar = useCallback(
    async (id: number): Promise<ApiError | null> => {
      dispatch({ tipo: 'clima/eliminando', id })

      try {
        await eliminarClima(id)
        dispatch({ tipo: 'clima/eliminado', id })
        mostrar('Consulta eliminada.', 'exito')
        return null
      } catch (fallo) {
        dispatch({ tipo: 'clima/noEliminado' })
        return avisarDelFallo(toApiError(fallo))
      }
    },
    [mostrar, avisarDelFallo],
  )

  const comentar = useCallback(
    async (climaId: number, contenido: string): Promise<ApiError | null> => {
      try {
        const comentario = await comentarClima(climaId, contenido)
        dispatch({ tipo: 'comentario/agregado', climaId, comentario })
        mostrar('Comentario publicado.', 'exito')
        return null
      } catch (fallo) {
        return avisarDelFallo(toApiError(fallo))
      }
    },
    [mostrar, avisarDelFallo],
  )

  const borrarComentario = useCallback(
    async (climaId: number, comentarioId: number): Promise<ApiError | null> => {
      try {
        await eliminarComentario(comentarioId)
        dispatch({ tipo: 'comentario/eliminado', climaId, comentarioId })
        mostrar('Comentario eliminado.', 'exito')
        return null
      } catch (fallo) {
        return avisarDelFallo(toApiError(fallo))
      }
    },
    [mostrar, avisarDelFallo],
  )

  const valor = useMemo<ValorDeClima>(
    () => ({ estado, recargar, buscarCiudad, eliminar, comentar, borrarComentario }),
    [estado, recargar, buscarCiudad, eliminar, comentar, borrarComentario],
  )

  return <ClimaContext.Provider value={valor}>{children}</ClimaContext.Provider>
}
