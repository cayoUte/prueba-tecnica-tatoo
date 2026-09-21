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

export function formatearTemperatura(celsius: number, fahrenheit: number): string {
  return `${celsius.toFixed(1)} °C / ${fahrenheit.toFixed(1)} °F`
}

/** Mayuscula inicial para las descripciones que OpenWeather devuelve en minuscula. */
export function capitalizar(texto: string): string {
  return texto.length === 0 ? texto : texto[0].toUpperCase() + texto.slice(1)
}
