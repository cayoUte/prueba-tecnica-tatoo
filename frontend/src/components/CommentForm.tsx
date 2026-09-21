import { useState } from 'react'
import type { FormEvent } from 'react'
import { useFormulario } from '../hooks/useFormulario'
import type { ErroresDe, Validador } from '../hooks/useFormulario'
import type { ApiError } from '../types/api'
import { longitudMaxima, longitudMinima, primerError, requerido } from '../utils/validaciones'
import { Alert } from './ui/Alert'
import { Button } from './ui/Button'
import { TextArea } from './ui/TextArea'

type Campos = { contenido: string }

const INICIALES: Campos = { contenido: '' }

const MAXIMO = 500

// Espeja StoreComentarioRequest: required, min 3, max 500.
const validar: Validador<Campos> = (valores) => {
  const errores: ErroresDe<Campos> = {}

  const contenido = primerError(
    requerido(valores.contenido, 'El comentario'),
    longitudMinima(valores.contenido, 3, 'El comentario'),
    longitudMaxima(valores.contenido, MAXIMO, 'El comentario'),
  )
  if (contenido !== undefined) errores.contenido = contenido

  return errores
}

interface Props {
  onEnviar: (contenido: string) => Promise<ApiError | null>
}

export function CommentForm({ onEnviar }: Props) {
  const { valores, esValido, cambiar, tocar, errorDe, marcarTodosTocados, aplicarErroresDeApi, reiniciar } =
    useFormulario(INICIALES, validar)
  const [aviso, setAviso] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const restantes = MAXIMO - valores.contenido.trim().length

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    marcarTodosTocados()
    setAviso(null)

    if (!esValido) return

    setEnviando(true)
    const fallo = await onEnviar(valores.contenido.trim())
    setEnviando(false)

    if (fallo === null) {
      reiniciar()
      return
    }

    aplicarErroresDeApi(fallo)

    if (Object.keys(fallo.errors).length === 0) {
      setAviso(fallo.message)
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-3" noValidate>
      {aviso !== null && <Alert>{aviso}</Alert>}

      <TextArea
        etiqueta="Agregar un comentario"
        name="contenido"
        rows={3}
        placeholder="Que tal el clima por alla?"
        value={valores.contenido}
        onChange={cambiar('contenido')}
        onBlur={tocar('contenido')}
        error={errorDe('contenido')}
      />

      <div className="flex items-center justify-between gap-3">
        <span
          className={
            restantes < 0
              ? 'text-xs text-red-600 dark:text-red-400'
              : 'text-xs text-slate-400 dark:text-slate-500'
          }
        >
          {restantes} caracteres restantes
        </span>

        <Button type="submit" cargando={enviando}>
          Comentar
        </Button>
      </div>
    </form>
  )
}
