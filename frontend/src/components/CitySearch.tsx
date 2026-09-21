import { useState } from 'react'
import type { FormEvent } from 'react'
import { useFormulario } from '../hooks/useFormulario'
import type { ErroresDe, Validador } from '../hooks/useFormulario'
import type { ApiError } from '../types/api'
import { longitudMaxima, longitudMinima, primerError, requerido } from '../utils/validaciones'
import { Alert } from './ui/Alert'
import { Button } from './ui/Button'
import { TextField } from './ui/TextField'

type Campos = { ciudad: string }

const INICIALES: Campos = { ciudad: '' }

// Las mismas reglas que StoreClimaRequest en el backend. El navegador avisa
// antes para no gastar un viaje, pero el servidor sigue siendo la autoridad.
const validar: Validador<Campos> = (valores) => {
  const errores: ErroresDe<Campos> = {}

  const ciudad = primerError(
    requerido(valores.ciudad, 'La ciudad'),
    longitudMinima(valores.ciudad, 2, 'La ciudad'),
    longitudMaxima(valores.ciudad, 80, 'La ciudad'),
  )
  if (ciudad !== undefined) errores.ciudad = ciudad

  return errores
}

interface Props {
  onBuscar: (ciudad: string) => Promise<ApiError | null>
  consultando: boolean
}

export function CitySearch({ onBuscar, consultando }: Props) {
  const { valores, esValido, cambiar, tocar, errorDe, marcarTodosTocados, aplicarErroresDeApi, reiniciar } =
    useFormulario(INICIALES, validar)
  const [aviso, setAviso] = useState<string | null>(null)

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    marcarTodosTocados()
    setAviso(null)

    if (!esValido) return

    const fallo = await onBuscar(valores.ciudad.trim())

    if (fallo === null) {
      reiniciar()
      return
    }

    // Un 422 trae el error del campo y se pinta bajo el input.
    // Un 404 (ciudad inexistente) o un 503 son de la operacion: van arriba.
    aplicarErroresDeApi(fallo)

    if (Object.keys(fallo.errors).length === 0) {
      setAviso(fallo.message)
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Consultar una ciudad</h2>
      <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
        Cada busqueda pregunta a OpenWeatherMap y queda guardada en el historial.
      </p>

      <form onSubmit={enviar} className="mt-4 space-y-3" noValidate>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex-1">
            <TextField
              etiqueta="Ciudad"
              name="ciudad"
              autoComplete="off"
              placeholder="Quito, Guayaquil, Loja..."
              value={valores.ciudad}
              onChange={cambiar('ciudad')}
              onBlur={tocar('ciudad')}
              error={errorDe('ciudad')}
            />
          </div>

          {/* El margen superior alinea el boton con el input, no con su etiqueta. */}
          <Button type="submit" cargando={consultando} className="sm:mt-7">
            Consultar
          </Button>
        </div>

        {aviso !== null && <Alert>{aviso}</Alert>}
      </form>
    </section>
  )
}
