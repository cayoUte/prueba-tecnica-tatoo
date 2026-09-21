import { useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import { ThemeToggle } from './ThemeToggle'
import { Button } from './ui/Button'

export function Layout({ children }: { children: ReactNode }) {
  const { usuario, salir } = useAuth()
  const [saliendo, setSaliendo] = useState(false)

  async function cerrarSesion() {
    setSaliendo(true)
    // No hace falta redirigir: al quedar sin usuario, ProtectedRoute
    // manda solo al login. Una unica fuente de verdad.
    await salir()
    setSaliendo(false)
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-slate-900 dark:text-slate-50">Consulta de Clima</p>
            {usuario !== null && (
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">Hola, {usuario.name}</p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <ThemeToggle />
            <Button variante="fantasma" onClick={cerrarSesion} cargando={saliendo}>
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">{children}</main>
    </div>
  )
}
