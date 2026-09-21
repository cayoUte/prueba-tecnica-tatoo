<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreComentarioRequest;
use App\Http\Resources\ComentarioResource;
use App\Models\Clima;
use App\Models\Comentario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ComentarioController extends Controller
{
    /**
     * Agrega un comentario a una consulta de clima.
     * El clima viene de la ruta y el autor de la sesion: el cliente solo
     * manda el contenido, asi no puede falsificar a quien pertenece.
     */
    public function store(StoreComentarioRequest $request, Clima $clima): JsonResponse
    {
        $comentario = $clima->comentarios()->make($request->validated());
        $comentario->user()->associate($request->user());
        $comentario->save();

        return (new ComentarioResource($comentario->load('user')))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function destroy(Request $request, Comentario $comentario): Response
    {
        abort_unless(
            $comentario->user_id === $request->user()->id,
            Response::HTTP_FORBIDDEN,
            'Solo puedes eliminar tus propios comentarios.',
        );

        $comentario->delete();

        return response()->noContent();
    }
}
