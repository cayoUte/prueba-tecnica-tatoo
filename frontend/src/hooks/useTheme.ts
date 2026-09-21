import { useCallback, useEffect, useState } from 'react'

type Tema = 'claro' | 'oscuro'

const CLAVE = 'tema'

function temaInicial(): Tema {
  try {
    const guardado = localStorage.getItem(CLAVE)
    if (guardado === 'claro' || guardado === 'oscuro') return guardado
  } catch {
    // En modo privado localStorage puede lanzar: seguimos con el default.
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro'
}

export function useTheme() {
  const [tema, setTema] = useState<Tema>(temaInicial)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', tema === 'oscuro')
    try {
      localStorage.setItem(CLAVE, tema)
    } catch {
      // Si no se puede guardar, el tema simplemente no se recuerda.
    }
  }, [tema])

  const alternar = useCallback(() => {
    setTema((actual) => (actual === 'claro' ? 'oscuro' : 'claro'))
  }, [])

  return { tema, alternar }
}
