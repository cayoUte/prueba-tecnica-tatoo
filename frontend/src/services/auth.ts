import { http } from '../lib/http'
import type { User } from '../types/api'

export interface Credenciales {
  email: string
  password: string
}

export interface DatosDeRegistro extends Credenciales {
  name: string
  password_confirmation: string
}

/**
 * Laravel entrega la cookie XSRF-TOKEN en esta ruta. Hay que pedirla antes
 * de cualquier peticion que modifique estado, o el backend responde 419.
 */
async function obtenerCookieCsrf(): Promise<void> {
  await http.get('/sanctum/csrf-cookie')
}

export async function obtenerUsuarioActual(): Promise<User> {
  // Esta ruta devuelve el usuario sin envoltorio `data`: es un closure
  // en routes/api.php que retorna $request->user() directo.
  const { data } = await http.get<User>('/api/user')
  return data
}

export async function iniciarSesion(credenciales: Credenciales): Promise<User> {
  await obtenerCookieCsrf()
  await http.post('/login', credenciales)
  return obtenerUsuarioActual()
}

export async function registrar(datos: DatosDeRegistro): Promise<User> {
  await obtenerCookieCsrf()
  await http.post('/register', datos)
  return obtenerUsuarioActual()
}

export async function cerrarSesion(): Promise<void> {
  await http.post('/logout')
}
