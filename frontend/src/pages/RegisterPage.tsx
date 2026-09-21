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
import { coincideCon, correoValido, longitudMinima, primerError, requerido } from '../utils/validaciones'

type Campos = {
  name: string
  email: string
  password: string
  password_confirmation: string
}

const INICIALES: Campos = { name: '', email: '', password: '', password_confirmation: '' }

const validar: Validador<Campos> = (valores) => {
  const errores: ErroresDe<Campos> = {}

  const name = primerError(requerido(valores.name, 'El nombre'), longitudMinima(valores.name, 2, 'El nombre'))
  if (name !== undefined) errores.name = name

  const email = primerError(requerido(valores.email, 'El correo'), correoValido(valores.email))
  if (email !== undefined) errores.email = email

  const password = primerError(
    requerido(valores.password, 'La contrasena'),
    longitudMinima(valores.password, 8, 'La contrasena'),
  )
  if (password !== undefined) errores.password = password

  const confirmacion = primerError(
    requerido(valores.password_confirmation, 'La confirmacion'),
    coincideCon(valores.password_confirmation, valores.password, 'Las contrasenas no coinciden.'),
  )
  if (confirmacion !== undefined) errores.password_confirmation = confirmacion

  return errores
}

export function RegisterPage() {
  const { registrarse } = useAuth()
  const { valores, esValido, cambiar, tocar, errorDe, marcarTodosTocados, aplicarErroresDeApi } = useFormulario(
    INICIALES,
    validar,
  )
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    marcarTodosTocados()

    if (!esValido) return

    setEnviando(true)
    setError(null)

    try {
      await registrarse(valores)
    } catch (fallo) {
      const apiError = toApiError(fallo)

      // El backend valida lo mismo que nosotros y algo mas que el navegador
      // no puede saber, como que el correo ya este registrado. Esos errores
      // se pintan junto a su campo; el resto va al aviso general.
      aplicarErroresDeApi(apiError)

      if (Object.keys(apiError.errors).length === 0) {
        setError(apiError.message)
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthLayout
      titulo="Crea tu cuenta"
      descripcion="Con una cuenta puedes consultar ciudades y dejar comentarios."
      pie={
        <>
          Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-sky-700 hover:underline dark:text-sky-400">
            Inicia sesion
          </Link>
        </>
      }
    >
      <form onSubmit={enviar} className="space-y-4" noValidate>
        {error !== null && <Alert>{error}</Alert>}

        <TextField
          etiqueta="Nombre"
          name="name"
          autoComplete="name"
          placeholder="Como te llamas"
          value={valores.name}
          onChange={cambiar('name')}
          onBlur={tocar('name')}
          error={errorDe('name')}
        />

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
          autoComplete="new-password"
          value={valores.password}
          onChange={cambiar('password')}
          onBlur={tocar('password')}
          error={errorDe('password')}
          ayuda="Minimo 8 caracteres."
        />

        <TextField
          etiqueta="Repite la contrasena"
          type="password"
          name="password_confirmation"
          autoComplete="new-password"
          value={valores.password_confirmation}
          onChange={cambiar('password_confirmation')}
          onBlur={tocar('password_confirmation')}
          error={errorDe('password_confirmation')}
        />

        <Button type="submit" cargando={enviando} className="w-full">
          Crear cuenta
        </Button>
      </form>
    </AuthLayout>
  )
}
