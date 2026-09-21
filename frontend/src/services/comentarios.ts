import { http } from '../lib/http'
import type { Comentario, Envelope } from '../types/api'

export async function comentarClima(climaId: number, contenido: string): Promise<Comentario> {
  const { data } = await http.post<Envelope<Comentario>>(
    `/api/climas/${climaId}/comentarios`,
    { contenido },
  )
  return data.data
}

export async function eliminarComentario(id: number): Promise<void> {
  await http.delete(`/api/comentarios/${id}`)
}
