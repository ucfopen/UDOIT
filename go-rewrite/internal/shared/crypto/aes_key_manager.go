package crypto

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"fmt"
	"io"
)

// AESKeyManager is a simple same-process key manager that uses AES-GCM for key
// wrapping. It does not currently support key rotation, so it ignores keyID
// parameters and always uses its single KEK.
type AESKeyManager struct {
	aead cipher.AEAD
}

func NewAESKeyManager(masterKey []byte) (*AESKeyManager, error) {
	block, err := aes.NewCipher(masterKey)
	if err != nil {
		return nil, err
	}

	aead, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	return &AESKeyManager{aead: aead}, nil
}

func (m *AESKeyManager) WrapKey(ctx context.Context, keyID string, plaintextDEK []byte) ([]byte, error) {
	_ = ctx
	_ = keyID

	// This implementation currently uses a random nonce without extra guards
	// against duplicate (KEK, nonce) pairs. With AES-GCM, if two plaintexts are
	// encrypted with the same KEK and nonce, their data can be exposed without
	// access to the KEK, so a more secure approach should be implemented.
	nonce := make([]byte, m.aead.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, err
	}

	sealed := m.aead.Seal(nil, nonce, plaintextDEK, nil)
	out := make([]byte, 0, len(nonce)+len(sealed))
	out = append(out, nonce...)
	out = append(out, sealed...)

	return out, nil
}

func (m *AESKeyManager) UnwrapKey(ctx context.Context, keyID string, encryptedDEK []byte) ([]byte, error) {
	_ = ctx
	_ = keyID

	nonceSize := m.aead.NonceSize()
	if len(encryptedDEK) < nonceSize {
		return nil, fmt.Errorf("wrapped DEK too short")
	}

	nonce := encryptedDEK[:nonceSize]
	sealed := encryptedDEK[nonceSize:]

	plaintext, err := m.aead.Open(nil, nonce, sealed, nil)
	if err != nil {
		return nil, err
	}

	return plaintext, nil
}

var _ KeyManager = (*AESKeyManager)(nil)
