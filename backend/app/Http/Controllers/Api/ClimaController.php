<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreClimaRequest;
use App\Http\Resources\ClimaResource;
use App\Models\Clima;
use App\Services\Weather\WeatherService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ClimaController extends Controller
{
    public function __construct(
        private readonly WeatherService $weather,
    ) {}

    /**
     * Historial de consultas, de la mas reciente a la mas antigua.
     * Publico: la tabla se ve sin iniciar sesion.
     */
    public function index(): AnonymousResourceCollection
    {
        $climas = Clima::query()
            ->with('comentarios.user')
            ->latest('fecha_consulta')
            ->get();

        return ClimaResource::collection($climas);
    }

    public function show(Clima $clima): ClimaResource
    {
        return new ClimaResource($clima->load('comentarios.user'));
    }

    /**
     * Consulta OpenWeatherMap y guarda el resultado.
     * Si la ciudad no existe o el servicio falla, el WeatherService lanza
     * una excepcion que bootstrap/app.php convierte en 404 o 503.
     */
    public function store(StoreClimaRequest $request): JsonResponse
    {
        $datos = $this->weather->consultar($request->ciudad());

        $clima = Clima::create($datos->comoAtributos());

        return (new ClimaResource($clima))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function destroy(Clima $clima): Response
    {
        // Los comentarios se borran en cascada por la foreign key.
        $clima->delete();

        return response()->noContent();
    }
}
