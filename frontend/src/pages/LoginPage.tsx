import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { TextField } from '../components/ui/TextField'
import { useAuth } from '../hooks/useAuth'
import { useFormulario } from '../hooks/useFormulario'
import type { ErroresDe, Validador } from '../hooks/useFormulario'
import { toApiError } from '../lib/http'
import { correoValido, primerError, requerido } from '../utils/validaciones'
import { Logo } from '../components/Logo'

type Campos = { email: string; password: string }

const INICIALES: Campos = { email: '', password: '' }

// Definido fuera del componente para que sea la misma funcion en cada render.
const validar: Validador<Campos> = (valores) => {
  const errores: ErroresDe<Campos> = {}

  const email = primerError(requerido(valores.email, 'El correo'), correoValido(valores.email))
  if (email !== undefined) errores.email = email

  const password = requerido(valores.password, 'La contrasena')
  if (password !== undefined) errores.password = password

  return errores
}

export function LoginPage() {
  const { entrar } = useAuth()
  const { valores, esValido, cambiar, tocar, errorDe, marcarTodosTocados } = useFormulario(INICIALES, validar)
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    marcarTodosTocados()

    if (!esValido) return

    setEnviando(true)
    setError(null)

    try {
      await entrar(valores)
    } catch (fallo) {
      const apiError = toApiError(fallo)

      // Un 422 aqui significa credenciales que no coinciden. A proposito no
      // decimos cual de los dos campos falla: revelar que un correo existe
      // le sirve a quien esta probando correos, no al usuario legitimo.
      setError(apiError.status === 422 ? 'Correo o contrasena incorrectos.' : apiError.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthLayout
      titulo="Bienvenido a Weathery"
      pie={
        <>
          No tienes cuenta?{' '}
          <Link to="/registro" className="font-medium text-acento-rosa hover:underline">
            Registrate
          </Link>
        </>
      }
      logo={Logo({ tamano: '5xl' })}
    >
      <form onSubmit={enviar} className="space-y-4" noValidate>
        {error !== null && <Alert>{error}</Alert>}

        <TextField
          etiqueta="Correo"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          value={valores.email}
          onChange={cambiar('email')}
          onBlur={tocar('email')}
          error={errorDe('email')}
        />

        <TextField
          etiqueta="Contrasena"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="********"
          value={valores.password}
          onChange={cambiar('password')}
          onBlur={tocar('password')}
          error={errorDe('password')}
        />

        <Button type="submit" cargando={enviando} className="w-full">
          Entrar
        </Button>
      </form>
    </AuthLayout>
  )
}
