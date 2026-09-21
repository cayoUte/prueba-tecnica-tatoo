import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/** Impide volver al login o al registro cuando ya hay sesion abierta. */
export function GuestRoute() {
  const { usuario, cargandoSesion } = useAuth()

  if (cargandoSesion) return null

  return usuario === null ? <Outlet /> : <Navigate to="/" replace />
}
