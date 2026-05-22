<?php

namespace App\Services\Encryption;

interface EncryptionServiceInterface
{
  public function encrypt(string $plaintext): string;

  public function decrypt(string $ciphertext): string;
}
