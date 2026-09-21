<?php

namespace App\Services\Weather\Exceptions;

use RuntimeException;

/**
 * El servicio externo fallo, no respondio o esta mal configurado.
 * Se traduce a HTTP 503: el problema no es del cliente.
 */
class ClimaNoDisponibleException extends RuntimeException
{
}
