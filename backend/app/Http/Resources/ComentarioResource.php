<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Comentario
 */
class ComentarioResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'contenido' => $this->contenido,
            'created_at' => $this->created_at,
            // Solo el nombre: el email del usuario no tiene por que salir en la API.
            'autor' => $this->whenLoaded('user', fn (): string => $this->user->name),
            // Permite al frontend ofrecer el boton de eliminar solo al autor.
            // La regla de verdad sigue en el controlador, que responde 403.
            'es_mio' => $request->user()?->id === $this->user_id,
        ];
    }
}
