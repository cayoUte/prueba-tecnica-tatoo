<?php

namespace App\Services\Weather;

use Carbon\CarbonImmutable;

/**
 * Una franja del pronostico. OpenWeatherMap las entrega cada 3 horas en el
 * plan gratuito, asi que esto no es "cada hora" sino "cada franja".
 */
final readonly class HoraPronostico
{
    public function __construct(
        public CarbonImmutable $hora,
        public float $temperatura,
        public int $humedad,
        public string $condicionClima,
    ) {}

    /**
     * Construye la franja desde un elemento de `list` de /forecast.
     *
     * @param  array<string, mixed>  $item
     */
    public static function desdeOpenWeather(array $item): self
    {
        return new self(
            hora: CarbonImmutable::createFromTimestampUTC((int) data_get($item, 'dt', 0)),
            temperatura: round((float) data_get($item, 'main.temp', 0), 2),
            humedad: (int) data_get($item, 'main.humidity', 0),
            condicionClima: (string) data_get($item, 'weather.0.description', 'desconocido'),
        );
    }
}
