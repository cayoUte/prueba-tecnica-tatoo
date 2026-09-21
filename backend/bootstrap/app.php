<?php

use App\Services\Weather\Exceptions\CiudadNoEncontradaException;
use App\Services\Weather\Exceptions\ClimaNoDisponibleException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->alias([
            'verified' => \App\Http\Middleware\EnsureEmailIsVerified::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        // Las excepciones del WeatherService se traducen aqui a codigos HTTP,
        // asi el servicio queda libre de detalles de transporte y los
        // controladores no necesitan try/catch.
        $exceptions->render(fn (CiudadNoEncontradaException $e) => response()->json([
            'message' => $e->getMessage(),
        ], 404));

        $exceptions->render(fn (ClimaNoDisponibleException $e) => response()->json([
            'message' => $e->getMessage(),
        ], 503));
    })->create();
