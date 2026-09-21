<?php

namespace Tests\Feature;

use App\Models\Clima;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ComentarioApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_comentar_exige_autenticacion(): void
    {
        $clima = Clima::factory()->create();

        $this->postJson("/api/climas/{$clima->id}/comentarios", ['contenido' => 'Hola'])
            ->assertUnauthorized();
    }

    public function test_un_usuario_autenticado_comenta_una_consulta(): void
    {
        $clima = Clima::factory()->create();
        $usuario = User::factory()->create(['name' => 'Cayo']);

        Sanctum::actingAs($usuario);

        $this->postJson("/api/climas/{$clima->id}/comentarios", ['contenido' => 'Que fresco esta hoy'])
            ->assertCreated()
            ->assertJsonPath('data.contenido', 'Que fresco esta hoy')
            ->assertJsonPath('data.autor', 'Cayo');

        // El autor y el clima los pone el servidor, no el cliente.
        $this->assertDatabaseHas('comentarios', [
            'clima_id' => $clima->id,
            'user_id' => $usuario->id,
        ]);
    }

    public function test_el_contenido_del_comentario_es_obligatorio(): void
    {
        $clima = Clima::factory()->create();
        Sanctum::actingAs(User::factory()->create());

        $this->postJson("/api/climas/{$clima->id}/comentarios", ['contenido' => ''])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('contenido');
    }

    public function test_nadie_puede_borrar_el_comentario_de_otro(): void
    {
        $clima = Clima::factory()->create();
        $autor = User::factory()->create();
        $intruso = User::factory()->create();

        $comentario = $clima->comentarios()->make(['contenido' => 'Mio']);
        $comentario->user()->associate($autor);
        $comentario->save();

        Sanctum::actingAs($intruso);

        $this->deleteJson("/api/comentarios/{$comentario->id}")
            ->assertForbidden();

        $this->assertDatabaseCount('comentarios', 1);
    }

    public function test_el_autor_si_puede_borrar_su_comentario(): void
    {
        $clima = Clima::factory()->create();
        $autor = User::factory()->create();

        $comentario = $clima->comentarios()->make(['contenido' => 'Mio']);
        $comentario->user()->associate($autor);
        $comentario->save();

        Sanctum::actingAs($autor);

        $this->deleteJson("/api/comentarios/{$comentario->id}")
            ->assertNoContent();

        $this->assertDatabaseCount('comentarios', 0);
    }
}
