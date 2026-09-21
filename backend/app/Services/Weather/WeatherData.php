<?php

namespace App\Services\Weather;

use Carbon\CarbonImmutable;

/**
 * Lo unico que nos interesa de la respuesta de OpenWeatherMap.
 * Es inmutable a proposito: una vez creado, nadie puede alterar la medicion.
 */
final readonly class WeatherData
{
    public function __construct(
        public string $ciudad,
        public float $temperatura,
        public int $humedad,
        public string $condicionClima,
        public CarbonImmutable $consultadoEn,
    ) {}

    /**
     * Construye el DTO desde el payload crudo de OpenWeatherMap.
     *
     * @param  array<string, mixed>  $payload
     */
    public static function desdeOpenWeather(array $payload): self
    {
        return new self(
            ciudad: (string) data_get($payload, 'name', ''),
            temperatura: round((float) data_get($payload, 'main.temp', 0), 2),
            humedad: (int) data_get($payload, 'main.humidity', 0),
            condicionClima: (string) data_get($payload, 'weather.0.description', 'desconocido'),
            consultadoEn: CarbonImmutable::now(),
        );
    }

    /**
     * Atributos listos para crear un modelo Clima.
     *
     * @return array<string, mixed>
     */
    public function comoAtributos(): array
    {
        return [
            'ciudad' => $this->ciudad,
            'temperatura' => $this->temperatura,
            'humedad' => $this->humedad,
            'condicion_clima' => $this->condicionClima,
            'fecha_consulta' => $this->consultadoEn,
        ];
    }
}
