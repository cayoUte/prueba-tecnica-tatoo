<?php

namespace App\Services\Weather;

use App\Services\Weather\Exceptions\CiudadNoEncontradaException;
use App\Services\Weather\Exceptions\ClimaNoDisponibleException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Unico punto del sistema que habla con OpenWeatherMap.
 * No sabe nada de HTTP entrante ni de Eloquent: recibe un nombre de ciudad
 * y devuelve un WeatherData, o lanza una excepcion de dominio.
 */
class WeatherService
{
    /**
     * Minutos que se reutiliza la respuesta de una misma ciudad.
     */
    private const MINUTOS_DE_CACHE = 10;

    private readonly string $apiKey;

    private readonly string $baseUrl;

    public function __construct()
    {
        $this->apiKey = (string) config('services.openweather.key');
        $this->baseUrl = rtrim((string) config('services.openweather.url'), '/');
    }

    /**
     * Clima actual de una ciudad, cacheado por MINUTOS_DE_CACHE.
     *
     * @throws CiudadNoEncontradaException si OpenWeatherMap no reconoce la ciudad
     * @throws ClimaNoDisponibleException  si el servicio externo falla o no responde
     */
    public function consultar(string $ciudad): WeatherData
    {
        $ciudad = trim($ciudad);

        return Cache::remember(
            'clima:'.mb_strtolower($ciudad),
            now()->addMinutes(self::MINUTOS_DE_CACHE),
            fn (): WeatherData => $this->pedirAOpenWeather($ciudad),
        );
    }

    private function pedirAOpenWeather(string $ciudad): WeatherData
    {
        if ($this->apiKey === '') {
            throw new ClimaNoDisponibleException(
                'Falta configurar OPENWEATHER_KEY en el archivo .env.'
            );
        }

        try {
            $respuesta = Http::timeout(8)->get("{$this->baseUrl}/weather", [
                'q' => $ciudad,
                'appid' => $this->apiKey,
                'units' => 'metric',
                'lang' => 'es',
            ]);
        } catch (ConnectionException $e) {
            // El mensaje real de cURL solo vive aqui: si no se registra,
            // un fallo de red se vuelve imposible de diagnosticar.
            Log::warning('No se pudo conectar con OpenWeatherMap', [
                'ciudad' => $ciudad,
                'error' => $e->getMessage(),
            ]);

            throw new ClimaNoDisponibleException(
                'No pudimos contactar al servicio de clima. Intenta de nuevo en un momento.',
                previous: $e,
            );
        }

        if ($respuesta->notFound()) {
            throw new CiudadNoEncontradaException($ciudad);
        }

        if ($respuesta->failed()) {
            Log::warning('OpenWeatherMap respondio con error', [
                'ciudad' => $ciudad,
                'status' => $respuesta->status(),
                'body' => $respuesta->body(),
            ]);

            throw new ClimaNoDisponibleException(
                'El servicio de clima no esta disponible en este momento.'
            );
        }

        return WeatherData::desdeOpenWeather($respuesta->json());
    }
}
