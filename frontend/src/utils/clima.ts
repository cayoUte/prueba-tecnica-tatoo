/**
 * Tipos de icono que sabemos dibujar. OpenWeather devuelve la descripcion en
 * espanol (`lang=es`), asi que el mapeo va por palabras clave en espanol.
 */
export type TipoClima = 'despejado' | 'parcial' | 'nubes' | 'lluvia' | 'tormenta' | 'nieve' | 'niebla'

// El orden importa: "tormenta con lluvia" tiene que caer en tormenta,
// "algo de nubes" en parcial antes de que "nub" lo atrape, y "nubes" es el
// comodin de casi todo lo que no es claro.
const REGLAS: [TipoClima, RegExp][] = [
  ['tormenta', /tormenta|trueno|el[eé]ctric/],
  ['nieve', /nieve|aguanieve|granizo|nevada/],
  ['lluvia', /lluvia|llovizna|chubasco|aguacero/],
  ['niebla', /niebla|neblina|bruma|humo|calima|polvo|arena|ceniza/],
  ['despejado', /despejado|claro|soleado/],
  ['parcial', /algo de nubes|nubes dispersas|parcial/],
  ['nubes', /nub|nublado|cubierto/],
]

export function tipoDeCondicion(descripcion: string): TipoClima {
  const texto = descripcion.toLowerCase()
  const regla = REGLAS.find(([, patron]) => patron.test(texto))
  return regla === undefined ? 'nubes' : regla[0]
}
