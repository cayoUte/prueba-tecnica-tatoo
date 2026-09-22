import type { FormEvent } from 'react'
import { useFormulario } from '../hooks/useFormulario'
import type { ErroresDe, Validador } from '../hooks/useFormulario'
import type { ApiError } from '../types/api'
import { cn } from '../utils/cn'
import { longitudMaxima, longitudMinima, primerError } from '../utils/validaciones'
import { useId } from 'react'
import { Spinner } from './ui/Spinner'

type Campos = { ciudad: string }

const INICIALES: Campos = { ciudad: '' }

// Las reglas de longitud de StoreClimaRequest. El navegador avisa antes para
// no gastar un viaje, pero el servidor sigue siendo la autoridad: alli la
// ciudad si es obligatoria.
//
// Aqui no lo es: un buscador vacio no es un formulario a medio rellenar, es
// que todavia no hay nada que buscar. Por eso el campo vacio no produce
// mensaje, ni al salir del input ni al pulsar la lupa.
const validar: Validador<Campos> = (valores) => {
  const errores: ErroresDe<Campos> = {}

  if (valores.ciudad.trim().length === 0) return errores

  const ciudad = primerError(
    longitudMinima(valores.ciudad, 2, 'La ciudad'),
    longitudMaxima(valores.ciudad, 80, 'La ciudad'),
  )
  if (ciudad !== undefined) errores.ciudad = ciudad

  return errores
}

function Lupa() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.8" />
      <path d="M13.5 13.5 17 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

interface Props {
  onBuscar: (ciudad: string) => Promise<ApiError | null>
  consultando: boolean
}

/**
 * Buscador de la barra superior: campo y boton unidos en un solo bloque,
 * separados por un divisor, como una barra de busqueda clasica.
 *
 * No usa TextField porque aqui el campo no lleva borde propio ni etiqueta
 * visible: el borde y el radio son del grupo entero, y el `aria-label` cubre
 * lo que la etiqueta haria.
 *
 * Los mensajes van en un globo flotante en vez de empujar el contenido: la
 * barra tiene altura fija y cualquier texto extra la descuadraria.
 */
export function CitySearch({ onBuscar, consultando }: Props) {
  const id = useId()
  const { valores, esValido, cambiar, tocar, errorDe, marcarTodosTocados, aplicarErroresDeApi, reiniciar } =
    useFormulario(INICIALES, validar)

  // Solo errores del propio campo. Lo demas (ciudad inexistente, servicio
  // caido, sesion expirada) lo anuncia el snackbar desde useWeather.
  const mensaje = errorDe('ciudad')

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    const ciudad = valores.ciudad.trim()

    // Con el campo vacio no se busca ni se avisa: no hay nada que decir.
    if (ciudad.length === 0) return

    marcarTodosTocados()

    if (!esValido) return

    const fallo = await onBuscar(ciudad)

    if (fallo === null) {
      reiniciar()
      return
    }

    aplicarErroresDeApi(fallo)
  }

  return (
    <form onSubmit={enviar} className="relative" noValidate>
      <div
        className={cn(
          'flex h-[30px] items-stretch overflow-hidden rounded-md border bg-noche-950/40 transition',
          'focus-within:outline-[0.5px] focus-within:outline-offset-0',
          mensaje !== undefined
            ? 'border-rose-400/70 focus-within:outline-rose-400'
            : 'border-white/15 focus-within:outline-acento-rosa/80',
        )}
      >
        <input
          id={id}
          name="ciudad"
          aria-label="Ciudad"
          autoComplete="off"
          placeholder="Busca una ciudad..."
          value={valores.ciudad}
          onChange={cambiar('ciudad')}
          onBlur={tocar('ciudad')}
          className="min-w-0 flex-1 bg-transparent px-3 text-[10px] text-white placeholder:text-acento-lila/45 focus:outline-none"
        />

        <button
          type="submit"
          disabled={consultando}
          aria-label="Consultar el clima de la ciudad"
          title="Consultar"
          className="flex w-9 shrink-0 items-center justify-center border-l border-white/15 bg-white/5 text-acento-lila/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-[0.5px] focus-visible:outline-offset-[-2px] focus-visible:outline-acento-rosa disabled:cursor-not-allowed disabled:opacity-60"
        >
          {consultando ? <Spinner /> : <Lupa />}
        </button>
      </div>

      {mensaje !== undefined && (
        <p
          role="alert"
          className="absolute top-full right-0 left-0 z-30 mt-1 rounded-md border border-rose-400/40 bg-noche-950/95 px-2 py-1 text-[10px] text-rose-200 backdrop-blur"
        >
          {mensaje}
        </p>
      )}
    </form>
  )
}
