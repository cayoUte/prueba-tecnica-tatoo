<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('climas')]
#[Fillable(['ciudad', 'temperatura', 'humedad', 'condicion_clima', 'fecha_consulta'])]
#[Appends(['temp_fahrenheit'])]
class Clima extends Model
{
    use HasFactory;

    /**
     * Conversion de tipos al leer de la base de datos.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'temperatura' => 'float',
            'humedad' => 'integer',
            'fecha_consulta' => 'datetime',
        ];
    }

    /**
     * Una consulta de clima puede tener varios comentarios.
     *
     * @return HasMany<Comentario, $this>
     */
    public function comentarios(): HasMany
    {
        return $this->hasMany(Comentario::class);
    }

    /**
     * Atributo dinamico: la temperatura almacenada en Celsius, expuesta en Fahrenheit.
     * Se agrega al JSON automaticamente por el atributo #[Appends] de la clase.
     */
    protected function tempFahrenheit(): Attribute
    {
        return Attribute::get(
            fn (): float => round($this->temperatura * 9 / 5 + 32, 1)
        );
    }
}
