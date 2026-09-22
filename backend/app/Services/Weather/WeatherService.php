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
 * No sabe nada de HTTP entrante ni de Eloquent: recibe un nombre de ciudad y
 * devuelve el clima actual (WeatherData) o su pronostico (HoraPronostico),
 * o lanza una excepcion de dominio.
 */
class WeatherService
{
    /**
     * Minutos que se reutiliza la respuesta de una misma ciudad.
     *
     * Lo que se guarda es el payload crudo, no los DTO ya construidos: un
     * objeto serializado revive como __PHP_Incomplete_Class si su clase no
     * esta cargada al deserializar, y ademas una entrada vieja sobreviviria
     * a un cambio de forma de la clase. Con datos planos eso no puede pasar.
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

        return WeatherData::desdeOpenWeather(
            Cache::remember(
                'clima:'.mb_strtolower($ciudad),
                now()->addMinutes(self::MINUTOS_DE_CACHE),
                fn (): array => $this->llamar('/weather', $ciudad),
            )
        );
    }

    /**
     * Pronostico por franjas de una ciudad, cacheado igual que el clima actual.
     *
     * OpenWeatherMap solo entrega futuro en el plan gratuito: las horas
     * pasadas son un producto aparte de pago. El pasado que muestra la
     * interfaz sale del historial ya guardado, no de aqui.
     *
     * @return list<HoraPronostico>
     *
     * @throws CiudadNoEncontradaException si OpenWeatherMap no reconoce la ciudad
     * @throws ClimaNoDisponibleException  si el servicio externo falla o no responde
     */
    public function pronostico(string $ciudad): array
    {
        $ciudad = trim($ciudad);

        $payload = Cache::remember(
            'pronostico:'.mb_strtolower($ciudad),
            now()->addMinutes(self::MINUTOS_DE_CACHE),
            // 8 franjas de 3 horas: las proximas 24 horas, que es lo que
            // cabe en el slider sin pedir de mas.
            fn (): array => $this->llamar('/forecast', $ciudad, ['cnt' => 8]),
        );

        /** @var list<array<string, mixed>> $lista */
        $lista = array_values((array) data_get($payload, 'list', []));

        return array_map(HoraPronostico::desdeOpenWeather(...), $lista);
    }

    /**
     * Unico punto que habla con OpenWeatherMap: centraliza la key, los
     * parametros comunes y la traduccion de fallos a excepciones del dominio.
     *
     * @param  array<string, mixed>  $extra
     * @return array<string, mixed>
     */
    private function llamar(string $ruta, string $ciudad, array $extra = []): array
    {
        if ($this->apiKey === '') {
            throw new ClimaNoDisponibleException(
                'Falta configurar OPENWEATHER_KEY en el archivo .env.'
            );
        }

        try {
            $respuesta = Http::timeout(8)->get("{$this->baseUrl}{$ruta}", [
                'q' => $ciudad,
                'appid' => $this->apiKey,
                'units' => 'metric',
                'lang' => 'es',
                ...$extra,
            ]);
        } catch (ConnectionException $e) {
            // El mensaje real de cURL solo vive aqui: si no se registra,
            // un fallo de red se vuelve imposible de diagnosticar.
            Log::warning('No se pudo conectar con OpenWeatherMap', [
                'ciudad' => $ciudad,
                'ruta' => $ruta,
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
                'ruta' => $ruta,
                'status' => $respuesta->status(),
                'body' => $respuesta->body(),
            ]);

            throw new ClimaNoDisponibleException(
                'El servicio de clima no esta disponible en este momento.'
            );
        }

        return (array) $respuesta->json();
    }
}
