import axios from 'axios'
import type { AxiosError } from 'axios'
import type { ApiError } from '../types/api'

const baseURL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000'

export const http = axios.create({
  baseURL,
  headers: { Accept: 'application/json' },
  // Sanctum autentica por cookies de sesion, asi que hay que enviarlas.
  withCredentials: true,
  // Y devolver el token CSRF que Laravel deja en la cookie XSRF-TOKEN.
  // axios lee esa cookie en cada peticion, por eso el token nuevo que
  // Laravel emite al iniciar sesion se usa solo, sin codigo de nuestra parte.
  withXSRFToken: true,
})

/** Mensajes propios para los estados donde Laravel responde en ingles. */
const MENSAJES: Record<number, string> = {
  401: 'Tu sesion expiro. Vuelve a iniciar sesion.',
  403: 'No tienes permiso para hacer eso.',
  404: 'No encontramos lo que buscabas.',
  419: 'La sesion caduco. Recarga la pagina e intentalo de nuevo.',
  429: 'Demasiados intentos. Espera unos segundos.',
  500: 'Algo se rompio en el servidor. Intentalo de nuevo.',
  503: 'El servicio de clima no esta disponible ahora mismo.',
}

/** Estados donde preferimos nuestro mensaje al del backend. */
const MENSAJE_PROPIO = new Set([401, 419, 500])

interface CuerpoDeError {
  message?: string
  errors?: Record<string, string[]>
}

/**
 * Convierte cualquier cosa que lance axios en una forma estable.
 * Los componentes nunca ven un AxiosError: solo un ApiError con
 * un mensaje mostrable y los errores por campo si los hubo.
 */
export function toApiError(error: unknown): ApiError {
  if (!axios.isAxiosError(error)) {
    return { status: null, message: 'Ocurrio un error inesperado.', errors: {} }
  }

  const fallo = error as AxiosError<CuerpoDeError>

  // Sin respuesta: el servidor no contesto (apagado, CORS, red caida).
  if (!fallo.response) {
    return {
      status: null,
      message: 'No pudimos conectar con el servidor. Revisa que la API este corriendo en el puerto 8000.',
      errors: {},
    }
  }

  const status = fallo.response.status
  const mensajeDelBackend = fallo.response.data?.message
  const usarPropio = MENSAJE_PROPIO.has(status) || !mensajeDelBackend

  return {
    status,
    message: usarPropio ? (MENSAJES[status] ?? 'Ocurrio un error inesperado.') : mensajeDelBackend,
    errors: fallo.response.data?.errors ?? {},
  }
}
