<?php

namespace App\Services;

const FIVE_MINUTES = 300;

class NonceService {
    private array $nonces = [];

    public function generateNonce(string $uuid): string {
        $nonce = bin2hex(random_bytes(8));
        $this->nonces[$uuid] = [$nonce, time()];
        return $nonce;
    }

    public function verifyNonce(string $nonceToVerify, string $uuid): bool {
        if (array_key_exists($uuid, $this->nonces)) {
            [$storedNonce, $timestamp] = $this->nonces[$uuid];
            unset($this->nonces[$uuid]);
            return time() - $timestamp < FIVE_MINUTES && $storedNonce === $nonceToVerify;
        }
        return false;
    }
}
