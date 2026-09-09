package crypto

import "context"

type EncryptedBlob struct {
	// KeyID is a globally unique identifier for the key used for encryption. Must
	// be visible to the persistence layer to allow querying based on key for
	// cases like key rotation.
	KeyID string
	// Data is the opaque encrypted data created and read solely by the cipher.
	// Currently, only one cipher implementation is allowed per database instance,
	// so no field specifying the cipher implementation is necessary.
	Data []byte
}

type Cipher interface {
	Encrypt(ctx context.Context, plaintext []byte) (EncryptedBlob, error)
	Decrypt(ctx context.Context, blob EncryptedBlob) ([]byte, error)
}
