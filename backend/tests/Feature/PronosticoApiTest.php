<?php

namespace Tests\Feature;

use App\Models\Clima;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Services\Weather\WeatherService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PronosticoApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Respuesta de /forecast recortada a lo que usa el servicio.
     *
     * @return array<string, mixed>
     */
    private function respuestaDeOpenWeather(int $franjas = 3): array
    {
        $lista = [];

        for ($i = 0; $i < $franjas; $i++) {
            $lista[] = [
                'dt' => 1_700_000_000 + ($i * 3 * 3600),
                'main' => ['temp' => 18.0 + $i, 'humidity' => 60 + $i],
                'weather' => [['description' => 'nubes dispersas']],
            ];
        }

        return ['list' => $lista];
    }

    public function test_el_pronostico_es_publico_y_devuelve_las_franjas(): void
    {
        Http::fake(['*/forecast*' => Http::response($this->respuestaDeOpenWeather())]);

        $clima = Clima::factory()->create(['ciudad' => 'Loja']);

        $this->getJson("/api/climas/{$clima->id}/pronostico")
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => [['hora', 'temperatura', 'temp_fahrenheit', 'humedad', 'condicion_clima']],
            ])
            ->assertJsonPath('data.0.temperatura', 18)
            // 18 C son 64.4 F: la conversion se expone ya hecha.
            ->assertJsonPath('data.0.temp_fahrenheit', 64.4);
    }

    public function test_pide_el_pronostico_de_la_ciudad_de_la_consulta(): void
    {
        Http::fake(['*/forecast*' => Http::response($this->respuestaDeOpenWeather(1))]);

        $clima = Clima::factory()->create(['ciudad' => 'Guayaquil']);

        $this->getJson("/api/climas/{$clima->id}/pronostico")->assertOk();

        Http::assertSent(fn ($peticion) => str_contains($peticion->url(), '/forecast')
            && $peticion['q'] === 'Guayaquil'
            && $peticion['units'] === 'metric');
    }

    public function test_si_el_servicio_externo_falla_responde_503(): void
    {
        Http::fake(['*/forecast*' => Http::response([], 500)]);

        $clima = Clima::factory()->create();

        $this->getJson("/api/climas/{$clima->id}/pronostico")->assertStatus(503);
    }

    /**
     * Regresion del mismo bug, por el invariante que lo evita: lo que entra
     * a la cache tiene que ser el payload plano. Se comprueba asi y no por
     * el driver porque en los tests la cache es de memoria y no serializa,
     * que es justo donde el fallo no se reproduce.
     */
    public function test_la_cache_guarda_datos_planos_y_no_objetos(): void
    {
        Http::fake(['*/forecast*' => Http::response($this->respuestaDeOpenWeather(2))]);

        app(WeatherService::class)->pronostico('Loja');

        $guardado = Cache::get('pronostico:loja');

        $this->assertIsArray($guardado);
        $this->assertArrayHasKey('list', $guardado);
        $this->assertSame([], array_filter($guardado['list'], 'is_object'));
    }

    /**
     * Regresion: la cache guardaba los DTO ya construidos y al releerlos
     * volvian como __PHP_Incomplete_Class, asi que la segunda peticion de
     * la misma ciudad reventaba con un 500.
     */
    public function test_la_segunda_peticion_se_sirve_de_cache_sin_romperse(): void
    {
        Http::fake(['*/forecast*' => Http::response($this->respuestaDeOpenWeather(2))]);

        $clima = Clima::factory()->create(['ciudad' => 'Quito']);

        $this->getJson("/api/climas/{$clima->id}/pronostico")->assertOk();
        $this->getJson("/api/climas/{$clima->id}/pronostico")
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.condicion_clima', 'nubes dispersas');

        // La segunda salio de cache: solo se llamo una vez al servicio.
        Http::assertSentCount(1);
    }

    public function test_una_consulta_inexistente_da_404(): void
    {
        $this->getJson('/api/climas/999/pronostico')->assertNotFound();
    }
}
