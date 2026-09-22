const FECHA = new Intl.DateTimeFormat('es-EC', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatearFecha(iso: string): string {
  const fecha = new Date(iso)
  return Number.isNaN(fecha.getTime()) ? '-' : FECHA.format(fecha)
}

/** Grados redondeados con el simbolo pegado, como en el diseno: `19°`. */
export function grados(valor: number): string {
  return `${Math.round(valor)}°`
}

/** Mayuscula inicial para las descripciones que OpenWeather devuelve en minuscula. */
export function capitalizar(texto: string): string {
  return texto.length === 0 ? texto : texto[0].toUpperCase() + texto.slice(1)
}

const HORA = new Intl.DateTimeFormat('es-EC', { hour: 'numeric', hour12: true })

/** `4 p. m.` para las etiquetas del slider horario. */
export function formatearHora(iso: string): string {
  const fecha = new Date(iso)
  return Number.isNaN(fecha.getTime()) ? '-' : HORA.format(fecha)
}
