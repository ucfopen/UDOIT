<?php

namespace App\Services\Encryption;

use App\Services\Encryption\EncryptionServiceInterface;
use App\Entity\Institution;

class InstitutionEncryptionService
{
  
    public function __construct(
        private EncryptionServiceInterface $encryptionService
    ) {}

    public function setClientSecret(Institution $institution, string $secret)
    {
        $institution->setApiClientSecretEncrypted($this->encryptionService->encrypt($secret));
    }

    public function getClientSecret(Institution $institution): string
    {
        return $this->encryptionService->decrypt($institution->getApiClientSecretEncrypted());
    }

}