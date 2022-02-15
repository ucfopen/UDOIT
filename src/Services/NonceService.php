<?php

namespace App\Services;

const FIVE_MINUTES = 300;

class NonceService {
    private SessionService $sessionService;

    public function __construct(SessionService $sessionService)
    {
        $this->sessionService = $sessionService;
    }

    public function generateNonce(string $uuid): string {
        $session = $this->sessionService->getSession($uuid);
        $nonce = bin2hex(random_bytes(8));
        $session->set('nonce', [$nonce, time()]);
        $this->sessionService->flush();
        return $nonce;
    }

    public function verifyNonce(string $nonceToVerify, string $uuid): bool {
        $session = $this->sessionService->getSession($uuid);
        $nonceData = $session->get('nonce', false);
        if ($nonceData) {
            [$storedNonce, $timestamp] = $nonceData;
            unset($session->getData()['nonce']);
            $this->sessionService->flush();
            return time() - $timestamp < FIVE_MINUTES && $storedNonce === $nonceToVerify;
        }
        return false;
    }
}
