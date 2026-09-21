<?php

/*
 * Traduccion parcial: solo las reglas que la API usa de verdad.
 * Lo que no este aqui cae al ingles por APP_FALLBACK_LOCALE.
 */

return [
    'confirmed' => 'La confirmacion de :attribute no coincide.',
    'email' => 'El campo :attribute debe ser un correo valido.',
    'lowercase' => 'El campo :attribute debe estar en minusculas.',
    'max' => [
        'string' => 'El campo :attribute no puede tener mas de :max caracteres.',
    ],
    'min' => [
        'string' => 'El campo :attribute debe tener al menos :min caracteres.',
    ],
    'required' => 'El campo :attribute es obligatorio.',
    'string' => 'El campo :attribute debe ser texto.',
    'unique' => 'Ese :attribute ya esta registrado.',

    'attributes' => [
        'ciudad' => 'ciudad',
        'contenido' => 'comentario',
        'email' => 'correo',
        'name' => 'nombre',
        'password' => 'contrasena',
    ],
];
