import { createContext } from 'react'
import type { ApiError, Clima, Comentario } from '../types/api'

/* -------------------------------------------------------------------------
 * Estado
 * ---------------------------------------------------------------------- */

/**
 * Como va la carga del historial. Es una union discriminada y no dos campos
 * sueltos (`cargando` + `error`) porque asi "cargando y fallido a la vez"
 * deja de ser representable: no hay que acordarse de limpiar uno al tocar
 * el otro, el tipo no lo permite.
 */
export type CargaHistorial =
  | { readonly estado: 'cargando' }
  | { readonly estado: 'listo' }
  | { readonly estado: 'fallo'; readonly mensaje: string }

export interface EstadoClima {
  /**
   * El historial completo, de la consulta mas reciente a la mas antigua.
   * Sobrevive a un fallo de recarga a proposito: es preferible enseñar datos
   * viejos junto al aviso que dejar la pantalla en blanco.
   */
  readonly climas: readonly Clima[]
  readonly carga: CargaHistorial
  /** true mientras una busqueda esta en vuelo. */
  readonly consultando: boolean
  /** Id de la consulta que se esta borrando, o null si no hay ninguna. */
  readonly eliminandoId: number | null
}

export const ESTADO_INICIAL: EstadoClima = {
  climas: [],
  carga: { estado: 'cargando' },
  consultando: false,
  eliminandoId: null,
}

/* -------------------------------------------------------------------------
 * Acciones
 *
 * Una interfaz por accion, con su payload dentro. El campo `tipo` es el
 * discriminante: al hacer `switch` sobre el, TypeScript estrecha cada rama
 * a su propia interfaz y el payload queda tipado sin castings.
 * ---------------------------------------------------------------------- */

/** El historial se esta pidiendo. Unica accion que vuelve a `cargando`. */
export interface AccionHistorialPedido {
  readonly tipo: 'historial/pedido'
}

export interface AccionHistorialRecibido {
  readonly tipo: 'historial/recibido'
  readonly climas: readonly Clima[]
}

export interface AccionHistorialFallido {
  readonly tipo: 'historial/fallido'
  readonly mensaje: string
}

export interface AccionConsultaIniciada {
  readonly tipo: 'consulta/iniciada'
}

/** La busqueda creo un registro: entra al principio del historial. */
export interface AccionConsultaCreada {
  readonly tipo: 'consulta/creada'
  readonly clima: Clima
}

export interface AccionConsultaFallida {
  readonly tipo: 'consulta/fallida'
}

export interface AccionClimaEliminando {
  readonly tipo: 'clima/eliminando'
  readonly id: number
}

export interface AccionClimaEliminado {
  readonly tipo: 'clima/eliminado'
  readonly id: number
}

/** El borrado fallo: solo apaga el indicador, la lista no cambia. */
export interface AccionClimaNoEliminado {
  readonly tipo: 'clima/noEliminado'
}

export interface AccionComentarioAgregado {
  readonly tipo: 'comentario/agregado'
  readonly climaId: number
  readonly comentario: Comentario
}

export interface AccionComentarioEliminado {
  readonly tipo: 'comentario/eliminado'
  readonly climaId: number
  readonly comentarioId: number
}

/** Todas las mutaciones posibles del estado de clima. */
export type AccionClima =
  | AccionHistorialPedido
  | AccionHistorialRecibido
  | AccionHistorialFallido
  | AccionConsultaIniciada
  | AccionConsultaCreada
  | AccionConsultaFallida
  | AccionClimaEliminando
  | AccionClimaEliminado
  | AccionClimaNoEliminado
  | AccionComentarioAgregado
  | AccionComentarioEliminado

/* -------------------------------------------------------------------------
 * Contexto
 * ---------------------------------------------------------------------- */

/**
 * Lo que consumen los componentes: el estado ya calculado y las operaciones
 * asincronas. `dispatch` no se expone: las transiciones validas salen de
 * estas funciones, que son las que saben hablar con la API.
 *
 * Las mutaciones devuelven `null` si salieron bien, o el ApiError si
 * fallaron, para que cada formulario decida como mostrar su propio error.
 */
export interface ValorDeClima {
  readonly estado: EstadoClima
  readonly recargar: () => Promise<void>
  readonly buscarCiudad: (ciudad: string) => Promise<ApiError | null>
  readonly eliminar: (id: number) => Promise<ApiError | null>
  readonly comentar: (climaId: number, contenido: string) => Promise<ApiError | null>
  readonly borrarComentario: (climaId: number, comentarioId: number) => Promise<ApiError | null>
}

// Este archivo no exporta componentes a proposito: asi el Fast Refresh de
// Vite sigue funcionando en el provider y en el hook.
export const ClimaContext = createContext<ValorDeClima | null>(null)
