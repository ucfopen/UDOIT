<?php

namespace App\EventListener;

use App\Exception\ApiException;
use App\Exception\InternalServerException;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\KernelEvents;

#[AsEventListener(event: KernelEvents::EXCEPTION, method: 'onKernelException', priority: 10)]
class ExceptionListener
{
    public function __construct(
        #[Autowire('%kernel.debug%')] private bool $isDebug
    ) {}

    public function onKernelException(ExceptionEvent $event): void
    {
        $exception = $event->getThrowable();

        if ($exception instanceof ApiException) {
            $event->setResponse($this->getCustomExceptionJsonResponse($exception));
            return;
        }
        
        // Handle Symfony HTTP exceptions
        // In the future, `errorCode` could be more semantic based on specific HTTP error
        if ($exception instanceof HttpExceptionInterface) {
            $event->setResponse(new JsonResponse([
                'errorCode' => 'HTTP_ERROR',
                'details' => [],
            ], $exception->getStatusCode()));
        }

        // Preserve default Symfony debug responses when error is unexpected
        if ($this->isDebug) {
            return;
        }

        $event->setResponse(
            $this->getCustomExceptionJsonResponse(new InternalServerException($exception))
        );
    }

    private function getCustomExceptionJsonResponse(ApiException $exception) {
        $errorDetails = $exception->getDetails();
        $errorCode = $exception->getErrorCode();
        $httpStatus = $exception->getCode();

        $response = [
            'errorCode' => $errorCode,
            'details' => $errorDetails,
        ];

        return new JsonResponse($response, $httpStatus);
    }
}