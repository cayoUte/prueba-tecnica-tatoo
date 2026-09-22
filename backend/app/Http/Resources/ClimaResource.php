<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Define la forma del JSON de un Clima. Es el contrato que consume React:
 * si manana agregamos una columna a la tabla, no se filtra sola a la API.
 *
 * @mixin \App\Models\Clima
 */
class ClimaResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ciudad' => $this->ciudad,
            'temperatura' => $this->temperatura,
            'temp_fahrenheit' => $this->temp_fahrenheit,
            'temp_min' => $this->temp_min,
            'temp_max' => $this->temp_max,
            'humedad' => $this->humedad,
            'condicion_clima' => $this->condicion_clima,
            'fecha_consulta' => $this->fecha_consulta,
            // whenLoaded evita disparar una consulta por fila si la relacion
            // no fue precargada con ->with('comentarios').
            'comentarios' => ComentarioResource::collection($this->whenLoaded('comentarios')),
        ];
    }
}
