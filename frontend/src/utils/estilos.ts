/**
 * Definicion de columnas compartida por la cabecera de la tabla y por cada
 * fila, para que queden alineadas sin repetir la rejilla en dos sitios.
 * En movil son dos columnas con etiqueta; desde md, seis columnas en linea.
 *
 * No incluye la utilidad `grid` a proposito: la cabecera necesita
 * `hidden md:grid` y las filas `grid`, y dos utilidades de display en la
 * misma clase se pisarian entre si.
 */
export const REJILLA_CLIMA =
  'grid-cols-2 gap-x-4 gap-y-2.5 md:grid-cols-[1.1fr_1.1fr_0.7fr_1.1fr_0.9fr_auto] md:items-center md:gap-4'
