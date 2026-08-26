<?php

namespace App\Exception;

abstract class ApiException extends \RuntimeException
{   
    // Should uniquely describe an error type
    protected string $errorCode;

    // Contains any additional error info (e.g. form field errors)
    protected array $details;

    protected function __construct(
        string $errorCode,
        int $httpStatus,
        string $message,
        array $details = [],
        ?\Throwable $cause = null, 
    ) {
        $this->errorCode = $errorCode;
        $this->details = $details;

        parent::__construct($message, $httpStatus, $cause);
    }

    public function getErrorCode(): string {
        return $this->errorCode;
    }

    public function getDetails(): array {
        return $this->details;
    }
}