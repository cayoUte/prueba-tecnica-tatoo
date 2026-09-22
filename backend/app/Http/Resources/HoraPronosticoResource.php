<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Forma del JSON de una franja de pronostico. Expone el Fahrenheit ya
 * calculado para que el frontend no repita la conversion que ya hace Clima.
 *
 * @mixin \App\Services\Weather\HoraPronostico
 */
class HoraPronosticoResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'hora' => $this->hora->toIso8601String(),
            'temperatura' => $this->temperatura,
            'temp_fahrenheit' => round($this->temperatura * 9 / 5 + 32, 1),
            'humedad' => $this->humedad,
            'condicion_clima' => $this->condicionClima,
        ];
    }
}
