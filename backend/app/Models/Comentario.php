<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('comentarios')]
#[Fillable(['contenido'])]
class Comentario extends Model
{
    use HasFactory;

    /**
     * Consulta de clima a la que pertenece el comentario.
     *
     * @return BelongsTo<Clima, $this>
     */
    public function clima(): BelongsTo
    {
        return $this->belongsTo(Clima::class);
    }

    /**
     * Usuario autenticado que escribio el comentario.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
