import { useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Snackbar } from '../components/Snackbar'
import { SnackbarContext } from './snackbar-context'
import type { Snack, TonoSnack } from './snackbar-context'

/** Milisegundos que un mensaje permanece en pantalla. */
const DURACION = 4000

/** Cuantos mensajes se apilan a la vez antes de descartar los mas viejos. */
const MAXIMO = 3

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [snacks, setSnacks] = useState<Snack[]>([])

  // Un contador propio en vez de Date.now(): dos mensajes lanzados en el
  // mismo milisegundo compartirian clave y React los trataria como uno.
  const siguienteId = useRef(0)

  // Los temporizadores se guardan para poder cancelarlos si el usuario
  // cierra el mensaje a mano, y no dejar un setState huerfano corriendo.
  const temporizadores = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const cerrar = useCallback((id: number) => {
    const temporizador = temporizadores.current.get(id)

    if (temporizador !== undefined) {
      clearTimeout(temporizador)
      temporizadores.current.delete(id)
    }

    setSnacks((previos) => previos.filter((snack) => snack.id !== id))
  }, [])

  const mostrar = useCallback(
    (mensaje: string, tono: TonoSnack = 'error') => {
      const id = siguienteId.current++

      setSnacks((previos) => [...previos, { id, mensaje, tono }].slice(-MAXIMO))

      temporizadores.current.set(
        id,
        setTimeout(() => {
          temporizadores.current.delete(id)
          setSnacks((previos) => previos.filter((snack) => snack.id !== id))
        }, DURACION),
      )
    },
    [],
  )

  const valor = useMemo(() => ({ mostrar, cerrar, snacks }), [mostrar, cerrar, snacks])

  return (
    <SnackbarContext.Provider value={valor}>
      {children}
      <Snackbar snacks={snacks} onCerrar={cerrar} />
    </SnackbarContext.Provider>
  )
}
