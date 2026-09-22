import { createContext } from 'react'

export type TonoSnack = 'exito' | 'error' | 'aviso'

export interface Snack {
  id: number
  mensaje: string
  tono: TonoSnack
}

export interface ValorDeSnackbar {
  /** Encola un mensaje. Se cierra solo pasados unos segundos. */
  mostrar: (mensaje: string, tono?: TonoSnack) => void
  cerrar: (id: number) => void
  snacks: Snack[]
}

// Este archivo no exporta componentes a proposito: asi el Fast Refresh de
// Vite sigue funcionando en el provider y en el hook.
export const SnackbarContext = createContext<ValorDeSnackbar | null>(null)
