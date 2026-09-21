<?php

namespace App\Services\Weather\Exceptions;

use RuntimeException;

/**
 * OpenWeatherMap no reconoce la ciudad pedida. Se traduce a HTTP 404.
 */
class CiudadNoEncontradaException extends RuntimeException
{
    public function __construct(public readonly string $ciudad)
    {
        parent::__construct("No encontramos informacion de clima para \"{$ciudad}\".");
    }
}
