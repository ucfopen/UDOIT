<?php

namespace App\Exception;

class InternalServerException extends ApiException
{
    public function __construct(?\Throwable $cause = null)
    {
        parent::__construct('INTERNAL_SERVER_ERROR', 500, 'An internal server error has occurred.', [], $cause);
    }
}