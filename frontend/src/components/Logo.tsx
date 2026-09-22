import { useId } from 'react'
import { cn } from '../utils/cn'

/** Los mismos nombres que la escala de texto de Tailwind. */
export type TamanoLogo =
  | 'xs'
  | 'sm'
  | 'base'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl'
  | '7xl'
  | '8xl'
  | '9xl'

/**
 * El tamano fija el ALTO, y el ancho sale solo del viewBox: la marca no es
 * cuadrada (289x226), asi que un `size-*` la deformaria.
 *
 * Cada alto coincide con su `text-*`: `xs` son los 0.75rem de `text-xs`,
 * `4xl` los 2.25rem de `text-4xl`, y asi. Las clases se escriben completas
 * porque Tailwind lee el archivo como texto y no encontraria una clase
 * armada por concatenacion.
 */
const TAMANOS: Record<TamanoLogo, string> = {
  xs: 'h-3', // 0.75rem
  sm: 'h-3.5', // 0.875rem
  base: 'h-4', // 1rem
  lg: 'h-4.5', // 1.125rem
  xl: 'h-5', // 1.25rem
  '2xl': 'h-6', // 1.5rem
  '3xl': 'h-7.5', // 1.875rem
  '4xl': 'h-9', // 2.25rem
  '5xl': 'h-12', // 3rem
  '6xl': 'h-15', // 3.75rem
  '7xl': 'h-18', // 4.5rem
  '8xl': 'h-24', // 6rem
  '9xl': 'h-32', // 8rem
}

interface Props {
  tamano?: TamanoLogo
  /**
   * Color de la nube de atras. En el diseno original es una forma de
   * contraste: oscura sobre fondo claro, clara sobre fondo oscuro. El default
   * es el lila de la paleta, que sirve para el fondo oscuro de la aplicacion.
   */
  nubeAtras?: string
  className?: string
}

/**
 * Marca de la aplicacion: sol detras de dos nubes.
 *
 * El hueco entre el sol y las nubes es transparente, no blanco: se recorta
 * con una mascara para que se vea el fondo que haya detras, igual que en el
 * diseno original. Por eso la marca funciona sobre el degradado de la app.
 *
 * Es el mismo dibujo que `public/favicon.svg`; si cambia uno, cambia el otro.
 * La geometria sale de medir la referencia: los circulos estan ajustados por
 * minimos cuadrados sobre su contorno, y los tres degradados resultaron ir
 * todos a 45 grados.
 */
export function Logo({ tamano = '4xl', nubeAtras = '#E0D9FF', className }: Props) {
  const id = useId()
  const sol = `${id}-sol`
  const calida = `${id}-calida`
  const azul = `${id}-azul`
  const atras = `${id}-atras`
  const principal = `${id}-principal`
  const frente = `${id}-frente`
  const corte = `${id}-corte`

  return (
    <svg
      viewBox="0 0 289 226"
      aria-hidden="true"
      className={cn(TAMANOS[tamano], 'w-auto shrink-0', className)}
    >
      <defs>
        <linearGradient id={sol} x1="40" y1="40" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset=".10" stopColor="#E0D9FF" />
          <stop offset=".45" stopColor="#C159EC" />
          <stop offset="1" stopColor="#C427FB" />
        </linearGradient>
        <linearGradient id={calida} x1="60" y1="60" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#E0D9FF" />
          <stop offset=".28" stopColor="#AEC9FF" />
          <stop offset=".54" stopColor="#7758D1" />
          <stop offset=".80" stopColor="#5936B4" />
          <stop offset="1" stopColor="#48319D" />
        </linearGradient>
        <linearGradient id={azul} x1="150" y1="150" x2="280" y2="280" gradientUnits="userSpaceOnUse">
          <stop offset=".10" stopColor="#AEC9FF" />
          <stop offset=".42" stopColor="#427BD1" />
          <stop offset=".75" stopColor="#48319D" />
          <stop offset="1" stopColor="#312B5B" />
        </linearGradient>

        <g id={atras}>
          <circle cx="178.5" cy="127.8" r="59.9" />
          <circle cx="230.6" cy="167.3" r="56.7" />
          <rect x="130" y="150" width="140" height="74" rx="38" />
        </g>
        <g id={principal}>
          <circle cx="37" cy="171.9" r="35.8" />
          <circle cx="92.6" cy="158.8" r="43.3" />
          <circle cx="167.5" cy="125.3" r="51.9" />
          <rect x="1" y="150" width="218" height="75" rx="36" />
        </g>
        <g id={frente}>
          <circle cx="220.6" cy="174.5" r="41.5" />
          <circle cx="175.2" cy="196.5" r="28.4" />
          <rect x="150" y="188" width="86" height="37" rx="32" />
        </g>

        {/* Muerde el sol con la silueta de las nubes, engordada por el trazo:
            ese sobrante es el hueco, y queda transparente. */}
        <mask id={corte} maskUnits="userSpaceOnUse" x="0" y="0" width="289" height="226">
          <rect width="289" height="226" fill="#FFF" />
          <g fill="#000" stroke="#000" strokeWidth="27" strokeLinejoin="round">
            <use href={`#${atras}`} />
            <use href={`#${principal}`} />
          </g>
        </mask>
      </defs>

      <circle cx="139.8" cy="102.9" r="101.6" fill={`url(#${sol})`} mask={`url(#${corte})`} />
      <use href={`#${atras}`} fill={nubeAtras} />
      <use href={`#${principal}`} fill={`url(#${calida})`} />
      <use href={`#${frente}`} fill={`url(#${azul})`} />
    </svg>
  )
}
