<?php

namespace Tests\Feature;

use App\Models\Clima;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ClimaApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Respuesta de OpenWeatherMap recortada a los campos que usa el servicio.
     *
     * @return array<string, mixed>
     */
    private function respuestaDeOpenWeather(): array
    {
        return [
            'name' => 'Loja',
            'main' => ['temp' => 20.0, 'humidity' => 65],
            'weather' => [['description' => 'cielo claro']],
        ];
    }

    public function test_el_historial_de_climas_es_publico(): void
    {
        Clima::factory()->count(3)->create();

        $this->getJson('/api/climas')
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => [[
                    'id', 'ciudad', 'temperatura', 'temp_fahrenheit',
                    'humedad', 'condicion_clima', 'fecha_consulta',
                ]],
            ]);
    }

    public function test_crear_una_consulta_exige_autenticacion(): void
    {
        $this->postJson('/api/climas', ['ciudad' => 'Loja'])
            ->assertUnauthorized();

        $this->assertDatabaseCount('climas', 0);
    }

    public function test_un_usuario_autenticado_consulta_y_guarda_el_clima(): void
    {
        Http::fake(['api.openweathermap.org/*' => Http::response($this->respuestaDeOpenWeather())]);
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/climas', ['ciudad' => 'Loja'])
            ->assertCreated()
            ->assertJsonPath('data.ciudad', 'Loja')
            ->assertJsonPath('data.temperatura', fn ($valor) => (float) $valor === 20.0)
            // 20 C son exactamente 68 F: el accessor temp_fahrenheit se prueba aqui.
            ->assertJsonPath('data.temp_fahrenheit', fn ($valor) => (float) $valor === 68.0);

        $this->assertDatabaseHas('climas', ['ciudad' => 'Loja', 'humedad' => 65]);
    }

    public function test_una_ciudad_inexistente_devuelve_404(): void
    {
        Http::fake(['api.openweathermap.org/*' => Http::response(['message' => 'city not found'], 404)]);
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/climas', ['ciudad' => 'CiudadQueNoExiste999'])
            ->assertNotFound();

        $this->assertDatabaseCount('climas', 0);
    }

    public function test_si_el_servicio_externo_falla_devuelve_503(): void
    {
        Http::fake(['api.openweathermap.org/*' => Http::response('', 500)]);
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/climas', ['ciudad' => 'Loja'])
            ->assertStatus(503);
    }

    public function test_la_ciudad_es_obligatoria(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/climas', ['ciudad' => ''])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('ciudad');
    }

    public function test_la_misma_ciudad_no_se_pide_dos_veces_a_openweather(): void
    {
        Http::fake(['api.openweathermap.org/*' => Http::response($this->respuestaDeOpenWeather())]);
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/climas', ['ciudad' => 'Loja'])->assertCreated();
        $this->postJson('/api/climas', ['ciudad' => 'Loja'])->assertCreated();

        // El cache evita la segunda llamada externa, pero cada peticion
        // si registra su propia consulta en el historial.
        Http::assertSentCount(1);
        $this->assertDatabaseCount('climas', 2);
    }

    public function test_borrar_un_clima_arrastra_sus_comentarios(): void
    {
        $clima = Clima::factory()->create();
        $autor = User::factory()->create();

        $comentario = $clima->comentarios()->make(['contenido' => 'Comentario de prueba']);
        $comentario->user()->associate($autor);
        $comentario->save();

        Sanctum::actingAs($autor);

        $this->deleteJson("/api/climas/{$clima->id}")->assertNoContent();

        $this->assertDatabaseCount('climas', 0);
        $this->assertDatabaseCount('comentarios', 0);
    }
}
