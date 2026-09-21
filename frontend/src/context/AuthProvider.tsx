import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import * as auth from '../services/auth'
import type { Credenciales, DatosDeRegistro } from '../services/auth'
import type { User } from '../types/api'
import { AuthContext } from './auth-context'
import type { ValorDeAuth } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null)
  const [cargandoSesion, setCargandoSesion] = useState(true)

  // Al montar preguntamos al backend si la cookie de sesion sigue viva.
  // Asi un F5 no te expulsa de la aplicacion.
  useEffect(() => {
    let vigente = true

    auth
      .obtenerUsuarioActual()
      .then((encontrado) => {
        if (vigente) setUsuario(encontrado)
      })
      .catch(() => {
        // Un 401 aqui no es un fallo: significa que no hay sesion abierta.
        if (vigente) setUsuario(null)
      })
      .finally(() => {
        if (vigente) setCargandoSesion(false)
      })

    return () => {
      vigente = false
    }
  }, [])

  const entrar = useCallback(async (credenciales: Credenciales) => {
    setUsuario(await auth.iniciarSesion(credenciales))
  }, [])

  const registrarse = useCallback(async (datos: DatosDeRegistro) => {
    setUsuario(await auth.registrar(datos))
  }, [])

  const salir = useCallback(async () => {
    try {
      await auth.cerrarSesion()
    } catch {
      // Si el backend ya invalido la sesion, igual cerramos del lado
      // del cliente: dejar al usuario atrapado seria peor.
    } finally {
      setUsuario(null)
    }
  }, [])

  const valor = useMemo<ValorDeAuth>(
    () => ({ usuario, cargandoSesion, entrar, registrarse, salir }),
    [usuario, cargandoSesion, entrar, registrarse, salir],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
