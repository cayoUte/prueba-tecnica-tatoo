import { AnimatePresence, motion } from 'framer-motion'
import type { ApiError, Comentario } from '../types/api'
import { cn } from '../utils/cn'
import { formatearFecha } from '../utils/formato'
import { CommentForm } from './CommentForm'
import { Button } from './ui/Button'

interface Props {
  comentarios: Comentario[]
  onComentar: (contenido: string) => Promise<ApiError | null>
  onEliminar: (comentarioId: number) => Promise<ApiError | null>
  className?: string
}

/**
 * Lista de comentarios y su formulario.
 *
 * La lista no tiene scroll propio: crece con su contenido y quien se desplaza
 * es el panel del detalle. Una barra dentro de otra obliga a adivinar cual se
 * esta moviendo y corta comentarios por la mitad.
 */
export function CommentSection({ comentarios, onComentar, onEliminar, className }: Props) {
  return (
    <div className={cn('flex flex-col gap-3 rounded-2xl bg-noche-950/40 p-4', className)}>
      <h3 className="text-[10px] font-semibold tracking-wider text-acento-lila/60 uppercase">
        {comentarios.length === 1 ? '1 comentario' : `${comentarios.length} comentarios`}
      </h3>

      {comentarios.length === 0 ? (
        <p className="text-[10px] text-acento-lila/65">Todavia no hay comentarios en esta consulta.</p>
      ) : (
        <ul className="space-y-2.5">
          <AnimatePresence initial={false}>
            {comentarios.map((comentario) => (
              <motion.li
                key={comentario.id}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.16 }}
                className="rounded-2xl border border-white/10 bg-white/5 px-3.5 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] text-white/90">{comentario.contenido}</p>
                    <p className="mt-1 text-[9px] text-acento-lila/55">
                      {comentario.autor ?? 'Anonimo'} · {formatearFecha(comentario.created_at)}
                    </p>
                  </div>

                  {/* El backend tambien lo verifica con un 403: esto solo evita
                      ofrecer un boton que iba a fallar. */}
                  {comentario.es_mio === true && (
                    <Button
                      variante="peligro"
                      onClick={() => void onEliminar(comentario.id)}
                      aria-label="Eliminar mi comentario"
                      className="shrink-0"
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <CommentForm onEnviar={onComentar} />
    </div>
  )
}
