import { useContext } from 'react'
import { AuthContext } from '../context/auth-context'
import type { ValorDeAuth } from '../context/auth-context'

export function useAuth(): ValorDeAuth {
  const contexto = useContext(AuthContext)

  if (contexto === null) {
    throw new Error('useAuth solo puede usarse dentro de <AuthProvider>.')
  }

  return contexto
}
