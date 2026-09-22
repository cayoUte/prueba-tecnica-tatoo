import { useContext } from 'react'
import { SnackbarContext } from '../context/snackbar-context'
import type { ValorDeSnackbar } from '../context/snackbar-context'

export function useSnackbar(): ValorDeSnackbar {
  const contexto = useContext(SnackbarContext)

  if (contexto === null) {
    throw new Error('useSnackbar solo puede usarse dentro de <SnackbarProvider>.')
  }

  return contexto
}
