import type { ReactNode } from 'react'

interface Props {
  titulo: string
  children: ReactNode
  pie: ReactNode
  logo: ReactNode
}

export function AuthLayout({ titulo, children, pie, logo }: Props) {
  return (
    <main className="flex min-h-dvh items-start justify-center px-4 pt-10 pb-16 sm:items-center sm:pt-4">
      <div className="w-full max-w-88">
        <div className="flex flex-col items-center py-8 sm:py-12">
          {logo && <div className="mb-4">{logo}</div>}
          <h4 className="text-center text-lg font-semibold tracking-tight">{titulo}</h4>

          {/* 250px es el ancho del formulario en la escala compacta. */}
          <div className="mt-5 w-[250px]">{children}</div>

          <p className="mt-5 text-center text-[10px] text-acento-lila/70">{pie}</p>
        </div>
      </div>
    </main>
  )
}
