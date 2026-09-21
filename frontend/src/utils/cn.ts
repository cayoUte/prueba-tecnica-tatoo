/** Une clases de Tailwind descartando las condicionales que no aplican. */
export function cn(...clases: (string | false | null | undefined)[]): string {
  return clases.filter(Boolean).join(' ')
}
