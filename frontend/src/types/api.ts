/**
 * Tipos que espejan los API Resources del backend.
 * Si cambia ClimaResource.php, este archivo tiene que cambiar con el.
 */

export interface User {
  id: number
  name: string
  email: string
}

export interface Comentario {
  id: number
  contenido: string
  created_at: string
  /** Solo el nombre del autor: la API no expone el email. */
  autor?: string
  /** true si el comentario lo escribio el usuario autenticado. */
  es_mio?: boolean
}

export interface Clima {
  id: number
  ciudad: string
  temperatura: number
  temp_fahrenheit: number
  humedad: number
  condicion_clima: string
  fecha_consulta: string
  /** Llega solo cuando el backend precargo la relacion. */
  comentarios?: Comentario[]
}

/** Los API Resources de Laravel envuelven la respuesta en `data`. */
export interface Envelope<T> {
  data: T
}

/**
 * Error normalizado de la API. `errores` viene poblado en los 422,
 * con un arreglo de mensajes por campo.
 */
export interface ApiError {
  status: number | null
  message: string
  errors: Record<string, string[]>
}
