<?php

use App\Http\Controllers\Api\ClimaController;
use App\Http\Controllers\Api\ComentarioController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas de la API
|--------------------------------------------------------------------------
| Lectura publica, escritura autenticada. Las rutas de registro y login
| las publica Breeze en routes/auth.php, dentro del grupo web, porque la
| autenticacion por cookies de Sanctum necesita sesion y CSRF.
*/

Route::get('/climas', [ClimaController::class, 'index']);
Route::get('/climas/{clima}', [ClimaController::class, 'show']);
Route::get('/climas/{clima}/pronostico', [ClimaController::class, 'pronostico']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn (Request $request) => $request->user());

    Route::post('/climas', [ClimaController::class, 'store']);
    Route::delete('/climas/{clima}', [ClimaController::class, 'destroy']);

    Route::post('/climas/{clima}/comentarios', [ComentarioController::class, 'store']);
    Route::delete('/comentarios/{comentario}', [ComentarioController::class, 'destroy']);
});
