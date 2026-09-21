<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreComentarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'contenido' => ['required', 'string', 'min:3', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'contenido.required' => 'El comentario no puede estar vacio.',
            'contenido.min' => 'El comentario necesita al menos 3 caracteres.',
            'contenido.max' => 'El comentario no puede pasar de 500 caracteres.',
        ];
    }
}
