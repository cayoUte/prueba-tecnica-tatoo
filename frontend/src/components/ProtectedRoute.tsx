import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Spinner } from './ui/Spinner'

export function ProtectedRoute() {
  const { usuario, cargandoSesion } = useAuth()

  // Mientras se comprueba la cookie de sesion no sabemos si hay usuario:
  // redirigir aqui expulsaria a quien si estaba logueado al recargar.
  if (cargandoSesion) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-slate-500 dark:text-slate-400">
        <Spinner className="size-6" />
        <span className="ml-3 text-sm">Comprobando tu sesion...</span>
      </div>
    )
  }

  return usuario === null ? <Navigate to="/login" replace /> : <Outlet />
}
