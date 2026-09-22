import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { Spinner } from './Spinner'

type Variante = 'primario' | 'secundario' | 'fantasma' | 'peligro'

/**
 * Los nombres de la escala de texto de Tailwind, mas `2xs` para los 10px de
 * la escala compacta de los formularios, que Tailwind no nombra.
 */
type Texto = '2xs' | 'xs' | 'sm' | 'base' | 'lg' | 'xl'

/**
 * Escritas completas a proposito: Tailwind escanea los archivos como texto,
 * asi que una clase armada con `text-${texto}` nunca llegaria a generarse.
 */
const TEXTOS: Record<Texto, string> = {
  '2xs': 'text-[10px]',
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  cargando?: boolean
  children: ReactNode
  texto?: Texto
}

// El alto lo fija `h-[30px]`, asi que las variantes solo llevan padding
// lateral: un `py-*` no cambiaria nada y solo confundiria al leerlo.
// Tampoco hay `text-*` aqui: eso lo pone `texto`. Si estuviera en los dos
// sitios ganaria el que Tailwind escriba despues en la hoja, no el ultimo
// que se pase en la clase.
const BASE =
  'inline-flex h-[30px] items-center justify-center gap-2 rounded-md font-medium transition ' +
  'focus-visible:outline-2 focus:outline-[0.5px] focus-visible:outline-offset-2 focus-visible:outline-acento-rosa ' +
  'disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]'

const VARIANTES: Record<Variante, string> = {
  primario:
    'degradado-acento px-4 text-white shadow-[0_10px_24px_-10px_rgba(193,89,236,0.8)] hover:brightness-110',
  secundario: 'border border-white/20 bg-white/10 px-4 text-white backdrop-blur hover:bg-white/15',
  fantasma: 'px-3 text-acento-lila/80 hover:bg-white/10 hover:text-white',
  peligro: 'px-3 text-rose-300 hover:bg-rose-400/15 hover:text-rose-200',
}

export function Button({
  texto = '2xs',
  variante = 'primario',
  cargando = false,
  children,
  className,
  disabled,
  ...resto
}: Props) {
  return (
    <button
      {...resto}
      disabled={disabled === true || cargando}
      className={cn(BASE, TEXTOS[texto], VARIANTES[variante], className)}
    >
      {cargando && <Spinner />}
      {children}
    </button>
  )
}
