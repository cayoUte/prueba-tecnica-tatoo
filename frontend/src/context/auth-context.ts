import { createContext } from 'react'
import type { Credenciales, DatosDeRegistro } from '../services/auth'
import type { User } from '../types/api'

export interface ValorDeAuth {
  usuario: User | null
  /** true mientras se averigua si ya habia sesion abierta. */
  cargandoSesion: boolean
  entrar: (credenciales: Credenciales) => Promise<void>
  registrarse: (datos: DatosDeRegistro) => Promise<void>
  salir: () => Promise<void>
}

// Este archivo no exporta componentes a proposito: asi el Fast Refresh de
// Vite sigue funcionando en el provider y en el hook.
export const AuthContext = createContext<ValorDeAuth | null>(null)
