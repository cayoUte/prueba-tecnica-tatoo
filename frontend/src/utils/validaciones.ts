/**
 * Validadores puros, sin React y sin JSX. Cada uno devuelve el mensaje de
 * error o undefined si el valor es valido, para poder componerlos.
 */

export function requerido(valor: string, nombre = 'Este campo'): string | undefined {
  return valor.trim().length === 0 ? `${nombre} es obligatorio.` : undefined
}

export function longitudMinima(valor: string, minimo: number, nombre = 'Este campo'): string | undefined {
  return valor.trim().length < minimo
    ? `${nombre} necesita al menos ${minimo} caracteres.`
    : undefined
}

export function longitudMaxima(valor: string, maximo: number, nombre = 'Este campo'): string | undefined {
  return valor.trim().length > maximo
    ? `${nombre} no puede pasar de ${maximo} caracteres.`
    : undefined
}

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function correoValido(valor: string): string | undefined {
  return FORMATO_EMAIL.test(valor.trim()) ? undefined : 'Escribe un correo valido.'
}

export function coincideCon(valor: string, otro: string, mensaje: string): string | undefined {
  return valor === otro ? undefined : mensaje
}

/** Devuelve el primer error de una lista de comprobaciones. */
export function primerError(...comprobaciones: (string | undefined)[]): string | undefined {
  return comprobaciones.find((error) => error !== undefined)
}
