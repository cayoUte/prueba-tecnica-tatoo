import { useState } from 'react'
import type { FormEvent } from 'react'
import { useFormulario } from '../hooks/useFormulario'
import type { ErroresDe, Validador } from '../hooks/useFormulario'
import type { ApiError } from '../types/api'
import { longitudMaxima, longitudMinima, primerError } from '../utils/validaciones'
import { Button } from './ui/Button'
import { TextArea } from './ui/TextArea'

type Campos = { contenido: string }

const INICIALES: Campos = { contenido: '' }

const MAXIMO = 500

// Espeja StoreComentarioRequest: required, min 3, max 500.
// Comentar es opcional, asi que el campo vacio no es un campo "obligatorio"
// sin rellenar: es que no hay nada que enviar. El mensaje lo dice asi.
const validar: Validador<Campos> = (valores) => {
  const errores: ErroresDe<Campos> = {}

  const contenido =
    valores.contenido.trim().length === 0
      ? 'Escribe un comentario antes de enviarlo.'
      : primerError(
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
  const [enviando, setEnviando] = useState(false)

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    marcarTodosTocados()

    if (!esValido) return

    setEnviando(true)
    const fallo = await onEnviar(valores.contenido.trim())
    setEnviando(false)

    if (fallo === null) {
      reiniciar()
      return
    }

    // Solo los errores por campo: el resto lo anuncia el snackbar.
    aplicarErroresDeApi(fallo)
  }

  return (
    <form onSubmit={enviar} className="space-y-3 flex flex-col" noValidate>
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

      {/* A lo ancho, igual que el boton de buscar cuando esta en su propia
          fila: no hay nada a su lado que justifique dejarlo estrecho. */}
      <div className="pt-2 pb-1">
        <Button type="submit" cargando={enviando} className="w-full">
          Comentar
        </Button>
      </div>
    </form>
  )
}
