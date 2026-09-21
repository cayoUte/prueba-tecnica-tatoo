<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreClimaRequest extends FormRequest
{
    public function authorize(): bool
    {
        // La autorizacion la resuelve el middleware auth:sanctum de la ruta.
        return true;
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'ciudad' => ['required', 'string', 'min:2', 'max:80'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'ciudad.required' => 'Escribe el nombre de una ciudad.',
            'ciudad.min' => 'El nombre de la ciudad es demasiado corto.',
            'ciudad.max' => 'El nombre de la ciudad es demasiado largo.',
        ];
    }

    /**
     * Ciudad ya validada y sin espacios sobrantes.
     */
    public function ciudad(): string
    {
        return trim((string) $this->validated('ciudad'));
    }
}
