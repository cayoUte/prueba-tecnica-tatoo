<?php

namespace Database\Factories;

use App\Models\Clima;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Clima>
 */
class ClimaFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $temperatura = fake()->randomFloat(2, -5, 40);

        return [
            'ciudad' => fake()->city(),
            'temperatura' => $temperatura,
            'temp_min' => round($temperatura - fake()->randomFloat(2, 0, 4), 2),
            'temp_max' => round($temperatura + fake()->randomFloat(2, 0, 4), 2),
            'humedad' => fake()->numberBetween(20, 100),
            'condicion_clima' => fake()->randomElement([
                'cielo claro', 'nubes dispersas', 'muy nuboso', 'lluvia ligera',
            ]),
            'fecha_consulta' => now(),
        ];
    }
}
