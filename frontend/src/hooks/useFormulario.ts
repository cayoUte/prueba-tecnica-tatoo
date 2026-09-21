import { useCallback, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { ApiError } from '../types/api'

export type ErroresDe<T> = Partial<Record<keyof T, string>>

/** Funcion pura que recibe los valores y devuelve un error por campo. */
export type Validador<T> = (valores: T) => ErroresDe<T>

/**
 * Formulario controlado con validacion en tiempo real.
 *
 * Un campo muestra su error en cuanto el usuario lo toca (al escribir o al
 * salir de el), nunca antes: mostrar "es obligatorio" en un formulario recien
 * abierto es ruido, no ayuda.
 */
export function useFormulario<T extends Record<string, string>>(
  iniciales: T,
  validar: Validador<T>,
) {
  const [valores, setValores] = useState<T>(iniciales)
  const [tocados, setTocados] = useState<Partial<Record<keyof T, boolean>>>({})
  const [erroresDelServidor, setErroresDelServidor] = useState<ErroresDe<T>>({})

  const erroresLocales = useMemo(() => validar(valores), [valores, validar])

  const esValido = Object.keys(erroresLocales).length === 0

  const cambiar = useCallback(
    (campo: keyof T) => (evento: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = evento.target
      setValores((previos) => ({ ...previos, [campo]: value }))
      setTocados((previos) => ({ ...previos, [campo]: true }))
      // El error que vino del servidor deja de aplicar en cuanto se edita.
      setErroresDelServidor((previos) => ({ ...previos, [campo]: undefined }))
    },
    [],
  )

  const tocar = useCallback(
    (campo: keyof T) => () => {
      setTocados((previos) => ({ ...previos, [campo]: true }))
    },
    [],
  )

  /** El error del servidor manda sobre el local: es el mas especifico. */
  const errorDe = useCallback(
    (campo: keyof T): string | undefined =>
      erroresDelServidor[campo] ?? (tocados[campo] ? erroresLocales[campo] : undefined),
    [erroresDelServidor, tocados, erroresLocales],
  )

  const marcarTodosTocados = useCallback(() => {
    setTocados(
      Object.fromEntries(Object.keys(valores).map((campo) => [campo, true])) as Partial<
        Record<keyof T, boolean>
      >,
    )
  }, [valores])

  /** Traslada los errores por campo de un 422 de Laravel al formulario. */
  const aplicarErroresDeApi = useCallback((error: ApiError) => {
    const traducidos = Object.entries(error.errors).reduce<ErroresDe<T>>((acumulado, [campo, mensajes]) => {
      acumulado[campo as keyof T] = mensajes[0]
      return acumulado
    }, {})

    setErroresDelServidor(traducidos)
  }, [])

  const reiniciar = useCallback(() => {
    setValores(iniciales)
    setTocados({})
    setErroresDelServidor({})
  }, [iniciales])

  return {
    valores,
    esValido,
    cambiar,
    tocar,
    errorDe,
    marcarTodosTocados,
    aplicarErroresDeApi,
    reiniciar,
  }
}
