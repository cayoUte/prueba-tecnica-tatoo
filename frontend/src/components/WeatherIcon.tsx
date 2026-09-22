import { useId } from 'react'
import type { TipoClima } from '../utils/clima'
import { cn } from '../utils/cn'

interface Props {
  tipo: TipoClima
  className?: string
}

/**
 * Iconos que imitan los 3D del diseno: nube blanca con volumen (brillo arriba
 * a la izquierda, sombra lila abajo), luna o sol asomando por detras, gotas
 * azules con reflejo, y un puno de particulas alrededor. viewBox de 96 para
 * escalarlos con `size-*`.
 *
 * Los ids de degradados, filtros y clips llevan el prefijo de useId porque un
 * <svg> inline comparte el espacio de ids con toda la pagina: con diez
 * tarjetas, diez `#nube` se pisarian y solo se pintaria el primero.
 */
export function WeatherIcon({ tipo, className }: Props) {
  const id = useId()
  const ids = {
    nube: `${id}-nube`,
    sombra: `${id}-sombra`,
    brillo: `${id}-brillo`,
    luna: `${id}-luna`,
    sol: `${id}-sol`,
    gota: `${id}-gota`,
    rayo: `${id}-rayo`,
    desenfoque: `${id}-desenfoque`,
    recorte: `${id}-recorte`,
  }

  const conNube = tipo !== 'despejado'
  // Las nubes de dia llevan el sol detras; las demas, la luna del diseno.
  const conSol = tipo === 'despejado' || tipo === 'parcial'

  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      aria-hidden="true"
      className={cn('drop-shadow-[0_12px_18px_rgba(0,0,0,0.4)]', className)}
    >
      <defs>
        <linearGradient id={ids.nube} x1="26" y1="30" x2="72" y2="78" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="0.55" stopColor="#EEEBFA" />
          <stop offset="1" stopColor="#CDC6EC" />
        </linearGradient>
        <linearGradient id={ids.sombra} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#A89FDC" stopOpacity="0" />
          <stop offset="1" stopColor="#8F84CF" stopOpacity="0.7" />
        </linearGradient>
        <radialGradient id={ids.brillo} cx="0" cy="0" r="1" gradientTransform="translate(42 40) scale(18 12)">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={ids.luna} cx="0" cy="0" r="1" gradientTransform="translate(70 22) scale(22)">
          <stop stopColor="#9B7BF0" />
          <stop offset="1" stopColor="#5936B4" />
        </radialGradient>
        <radialGradient id={ids.sol} cx="0" cy="0" r="1" gradientTransform="translate(-0.3 -0.35) scale(1.15)">
          <stop stopColor="#FFF3B0" />
          <stop offset="0.35" stopColor="#FFD44D" />
          <stop offset="1" stopColor="#E8891C" />
        </radialGradient>
        <radialGradient id={ids.gota} cx="0" cy="0" r="1" gradientTransform="translate(-0.25 -0.2) scale(1.2)">
          <stop stopColor="#B9EBFF" />
          <stop offset="0.45" stopColor="#4FB8F5" />
          <stop offset="1" stopColor="#1F62C9" />
        </radialGradient>
        <linearGradient id={ids.rayo} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#FFE680" />
          <stop offset="1" stopColor="#F5A623" />
        </linearGradient>
        <filter id={ids.desenfoque} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <clipPath id={ids.recorte}>
          <Nube />
        </clipPath>
      </defs>

      {/* Particulas flotando, como las bolitas alrededor de los iconos 3D. */}
      <g fill="#E0D9FF">
        <circle cx="14" cy="22" r="2.2" opacity="0.85" />
        <circle cx="22" cy="12" r="1.5" opacity="0.6" />
        <circle cx="86" cy="60" r="1.8" opacity="0.6" />
      </g>

      {conSol && (tipo === 'despejado' ? <Sol cx={48} cy={46} r={26} ids={ids} /> : <Sol cx={70} cy={30} r={17} ids={ids} />)}

      {conNube && !conSol && (
        <path
          d="M84 26a18 18 0 0 1-25.6 16.3A18 18 0 1 0 84 26Z"
          fill={`url(#${ids.luna})`}
          style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.35))' }}
        />
      )}

      {conNube && (
        <g>
          <Nube fill={`url(#${ids.nube})`} />
          {/* Sombra en la base y brillo arriba, recortados a la silueta de la nube. */}
          <g clipPath={`url(#${ids.recorte})`}>
            <rect x="0" y="46" width="96" height="40" fill={`url(#${ids.sombra})`} />
            <ellipse cx="42" cy="40" rx="18" ry="12" fill={`url(#${ids.brillo})`} opacity="0.9" />
            <ellipse cx="34" cy="60" rx="9" ry="7" fill="#FFFFFF" opacity="0.35" filter={`url(#${ids.desenfoque})`} />
          </g>
        </g>
      )}

      {tipo === 'lluvia' && (
        <>
          <Gota cx={34} cy={78} ids={ids} />
          <Gota cx={50} cy={84} ids={ids} />
          <Gota cx={66} cy={78} ids={ids} />
        </>
      )}

      {tipo === 'tormenta' && (
        <path
          d="M52 62 38 84h10l-4 12 16-24h-10l4-10Z"
          fill={`url(#${ids.rayo})`}
          stroke="#E8891C"
          strokeWidth="1"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 6px rgba(255,214,77,0.7))' }}
        />
      )}

      {tipo === 'nieve' && (
        <g fill="#FFFFFF">
          <circle cx="32" cy="78" r="3.5" />
          <circle cx="48" cy="86" r="3" />
          <circle cx="64" cy="78" r="3.5" />
          <circle cx="40" cy="92" r="2" opacity="0.7" />
          <circle cx="58" cy="93" r="2" opacity="0.7" />
        </g>
      )}

      {tipo === 'niebla' && (
        <g stroke="#E0D9FF" strokeWidth="4.5" strokeLinecap="round" opacity="0.85">
          <path d="M22 78h40M34 88h44" />
        </g>
      )}

      {tipo === 'nubes' && (
        // Lineas de viento como en el icono "partly cloudy / fast wind".
        <g stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.9">
          <path d="M24 80h30a5 5 0 1 0-5-5" />
          <path d="M34 90h14" opacity="0.6" />
        </g>
      )}
    </svg>
  )
}

/** Silueta de la nube: tres bultos y una base plana redondeada. */
function Nube({ fill }: { fill?: string }) {
  return (
    <path
      d="M30 74h40a16 16 0 0 0 3.6-31.6A22 22 0 0 0 31.5 36 17 17 0 0 0 30 74Z"
      fill={fill}
    />
  )
}

interface Ids {
  sol: string
  gota: string
}

/** Esfera amarilla con el brillo desplazado arriba a la izquierda y un halo. */
function Sol({ cx, cy, r, ids }: { cx: number; cy: number; r: number; ids: Ids }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r * 1.5} fill="#F5A623" opacity="0.14" />
      <circle cx={cx} cy={cy} r={r * 1.18} fill="#FFC94D" opacity="0.18" />
      <circle cx={cx} cy={cy} r={r} fill={`url(#${ids.sol})`} />
      <ellipse cx={cx - r * 0.3} cy={cy - r * 0.38} rx={r * 0.32} ry={r * 0.2} fill="#FFFFFF" opacity="0.55" />
    </g>
  )
}

/** Gota con reflejo blanco, como las del icono de lluvia del diseno. */
function Gota({ cx, cy, ids }: { cx: number; cy: number; ids: Ids }) {
  return (
    <g>
      <path
        d={`M${cx} ${cy - 8}c3.2 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 2.8-7 6-11Z`}
        fill={`url(#${ids.gota})`}
      />
      <ellipse cx={cx - 2} cy={cy + 1} rx="1.6" ry="2.6" fill="#FFFFFF" opacity="0.6" />
    </g>
  )
}
