import type { AccionClima, EstadoClima } from './clima-context'
import type { Clima } from '../types/api'

/** Aplica un cambio a un clima del historial y deja el resto intacto. */
function mapearClima(
  climas: readonly Clima[],
  id: number,
  cambiar: (clima: Clima) => Clima,
): readonly Clima[] {
  return climas.map((clima) => (clima.id === id ? cambiar(clima) : clima))
}

/**
 * Unica funcion que decide como cambia el estado del clima. Es pura: no
 * llama a la API ni lee nada de fuera, asi que se puede probar pasandole un
 * estado y una accion, sin montar React ni simular la red.
 */
export function climaReducer(estado: EstadoClima, accion: AccionClima): EstadoClima {
  switch (accion.tipo) {
    case 'historial/pedido':
      return { ...estado, carga: { estado: 'cargando' } }

    case 'historial/recibido':
      return { ...estado, climas: accion.climas, carga: { estado: 'listo' } }

    case 'historial/fallido':
      // Las consultas ya cargadas se conservan: un fallo al recargar no
      // deberia vaciar lo que el usuario ya estaba viendo.
      return { ...estado, carga: { estado: 'fallo', mensaje: accion.mensaje } }

    case 'consulta/iniciada':
      return { ...estado, consultando: true }

    case 'consulta/creada':
      return { ...estado, climas: [accion.clima, ...estado.climas], consultando: false }

    case 'consulta/fallida':
      return { ...estado, consultando: false }

    case 'clima/eliminando':
      return { ...estado, eliminandoId: accion.id }

    case 'clima/eliminado':
      return {
        ...estado,
        climas: estado.climas.filter((clima) => clima.id !== accion.id),
        eliminandoId: null,
      }

    case 'clima/noEliminado':
      return { ...estado, eliminandoId: null }

    case 'comentario/agregado':
      return {
        ...estado,
        climas: mapearClima(estado.climas, accion.climaId, (clima) => ({
          ...clima,
          comentarios: [...(clima.comentarios ?? []), accion.comentario],
        })),
      }

    case 'comentario/eliminado':
      return {
        ...estado,
        climas: mapearClima(estado.climas, accion.climaId, (clima) => ({
          ...clima,
          comentarios: (clima.comentarios ?? []).filter((c) => c.id !== accion.comentarioId),
        })),
      }

    default: {
      // Si se agrega una accion a la union y no se maneja aqui, `accion`
      // deja de ser `never` y esto no compila: el olvido se vuelve un error
      // de tipos en vez de un bug silencioso en tiempo de ejecucion.
      const imposible: never = accion
      return imposible
    }
  }
}
