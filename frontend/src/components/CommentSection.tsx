import { AnimatePresence, motion } from 'framer-motion'
import type { ApiError, Comentario } from '../types/api'
import { formatearFecha } from '../utils/formato'
import { CommentForm } from './CommentForm'
import { Button } from './ui/Button'

interface Props {
  comentarios: Comentario[]
  onComentar: (contenido: string) => Promise<ApiError | null>
  onEliminar: (comentarioId: number) => Promise<ApiError | null>
}

export function CommentSection({ comentarios, onComentar, onEliminar }: Props) {
  return (
    <div className="mt-3 space-y-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-950/60">
      {comentarios.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Todavia no hay comentarios en esta consulta.
        </p>
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
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-3 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-slate-800 dark:text-slate-200">{comentario.contenido}</p>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
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
                      className="shrink-0 text-xs"
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
