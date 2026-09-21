import { http } from '../lib/http'
import type { Clima, Envelope } from '../types/api'

export async function listarClimas(): Promise<Clima[]> {
  const { data } = await http.get<Envelope<Clima[]>>('/api/climas')
  return data.data
}

/** Consulta OpenWeatherMap a traves del backend y guarda el registro. */
export async function consultarCiudad(ciudad: string): Promise<Clima> {
  const { data } = await http.post<Envelope<Clima>>('/api/climas', { ciudad })
  return data.data
}

export async function eliminarClima(id: number): Promise<void> {
  await http.delete(`/api/climas/${id}`)
}
