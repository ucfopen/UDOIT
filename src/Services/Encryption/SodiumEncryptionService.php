<?php

namespace App\Services\Encryption;

class SodiumEncryptionService implements EncryptionServiceInterface
{

  private string $encodedKey = 'niLb/WbAODNi7E4ccHHa/pPU3Bd9h6z1NXmjA981D4o=';

  public function encrypt(string $plaintext): string
  {
    $key = base64_decode($this->encodedKey);
    $nonce = random_bytes(SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
    $encrypted_data = sodium_crypto_secretbox($plaintext, $nonce, $key);

    return base64_encode($nonce . $encrypted_data);
  }

  public function decrypt(string $ciphertext): string
  {
    $key = base64_decode($this->encodedKey);
    $decoded = base64_decode($ciphertext);
    $nonce   = mb_substr($decoded, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES, '8bit');
    $encrypted_text = mb_substr($decoded, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES, NULL, '8bit');

    return sodium_crypto_secretbox_open($encrypted_text, $nonce, $key);
  }
}