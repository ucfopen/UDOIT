<?php

namespace App\Services\Encryption;

use App\Services\Encryption\EncryptionServiceInterface;
use App\Entity\SigningKey;

class SigningKeyEncryptionService
{
  
    public function __construct(
        private EncryptionServiceInterface $encryptionService
    ) {}

    public function setPrivateKey(SigningKey $signingKey, string $secret)
    {
        $signingKey->setPrivateKeyEncrypted($this->encryptionService->encrypt($secret));
    }

    public function getPrivateKey(SigningKey $signingKey): string
    {
        return $this->encryptionService->decrypt($signingKey->getPrivateKeyEncrypted());
    }

}