import type { ReactNode } from 'react'
import { ThemeToggle } from './ThemeToggle'

interface Props {
  titulo: string
  descripcion: string
  children: ReactNode
  pie: ReactNode
}

export function AuthLayout({ titulo, descripcion, children, pie }: Props) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex justify-end px-4 py-3">
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-start justify-center px-4 pb-16 sm:items-center">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">{titulo}</h1>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">{descripcion}</p>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {children}
          </div>

          <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-400">{pie}</p>
        </div>
      </main>
    </div>
  )
}
