<?php

namespace App\Services\Encryption;

use App\Services\Encryption\EncryptionServiceInterface;
use App\Entity\Registration;

class RegistrationEncryptionService
{
  
    public function __construct(
        private EncryptionServiceInterface $encryptionService
    ) {}

    public function setClientSecret(Registration $registration, string $secret)
    {
        $registration->setApiClientSecretEncrypted($this->encryptionService->encrypt($secret));
    }

    public function getClientSecret(Registration $registration): string
    {
        return $this->encryptionService->decrypt($registration->getApiClientSecretEncrypted());
    }

    public function encryptKey(Registration $registration)
    {
        $currentKey = $registration->getApiClientSecretEncrypted();
        $encryptedKey = $this->encryptionService->encrypt($currentKey);
        $registration->setApiClientSecretEncrypted($encryptedKey);
    }

}