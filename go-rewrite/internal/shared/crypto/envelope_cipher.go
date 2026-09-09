package crypto

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/binary"
	"rewritetest/internal/shared/apperr"
)

type KeyManager interface {
	WrapKey(ctx context.Context, keyID string, plaintextDEK []byte) (wrappedDEK []byte, err error)
	UnwrapKey(ctx context.Context, keyID string, encryptedDEK []byte) (plaintextDEK []byte, err error)
}

// EnvelopeCypher is an implementation of the Cipher interface that uses envelope encryption.
// It encrypts data with a randomly generated Data Encryption Key (DEK) and then wraps the DEK
// using a KeyManager. The resulting encrypted blob has a format of [wrapped DEK + ciphertext].
type EnvelopeCypher struct {
	km           KeyManager
	currentKeyID string
}

var _ Cipher = (*EnvelopeCypher)(nil)

func NewEnvelopeCipher(km KeyManager, currentKeyID string) *EnvelopeCypher {
	return &EnvelopeCypher{
		km:           km,
		currentKeyID: currentKeyID,
	}
}

func (e *EnvelopeCypher) Encrypt(ctx context.Context, plaintext []byte) (EncryptedBlob, error) {
	// We can safely use a random DEK and a random nonce without any separate
	// collision protection since the number of possible combinations is 2^256 *
	// 2^96 = 2^352, making a collision astronomically unlikely.

	dek, err := generateRandomDEK()
	if err != nil {
		return EncryptedBlob{}, err
	}

	ciphertext, nonce, err := encryptAESGCM(dek, plaintext)
	if err != nil {
		return EncryptedBlob{}, err
	}
	wrapped, err := e.km.WrapKey(ctx, e.currentKeyID, dek)
	if err != nil {
		return EncryptedBlob{}, err
	}

	env := &envelope{
		nonce:      nonce,
		wrappedKey: wrapped,
		ciphertext: ciphertext,
	}
	data, err := env.marshalBinary()
	if err != nil {
		return EncryptedBlob{}, err
	}

	return EncryptedBlob{
		Data:  data,
		KeyID: e.currentKeyID,
	}, nil
}

func (e *EnvelopeCypher) Decrypt(ctx context.Context, blob EncryptedBlob) ([]byte, error) {
	env := &envelope{}
	err := env.unmarshalBinary(blob.Data)
	if err != nil {
		return nil, err
	}

	dek, err := e.km.UnwrapKey(ctx, blob.KeyID, env.wrappedKey)
	if err != nil {
		return nil, err
	}

	plaintext, err := decryptAESGCM(dek, env.nonce, env.ciphertext)
	if err != nil {
		return nil, err
	}

	return plaintext, nil
}

func generateRandomDEK() ([]byte, error) {
	dek := make([]byte, 32)
	_, err := rand.Read(dek)
	if err != nil {
		return nil, err
	}
	return dek, nil
}

type envelope struct {
	nonce      []byte
	wrappedKey []byte
	ciphertext []byte
}

// marshalBinary encodes the envelope as
//
// [4 bytes len(nonce)][nonce]
// [4 bytes len(wrappedKey)][wrappedKey]
// [ciphertext] (remainder of the buffer)
func (e *envelope) marshalBinary() ([]byte, error) {
	buf := make([]byte, 0, 4+len(e.nonce)+4+len(e.wrappedKey)+len(e.ciphertext))

	buf = binary.BigEndian.AppendUint32(buf, uint32(len(e.nonce)))
	buf = append(buf, e.nonce...)

	buf = binary.BigEndian.AppendUint32(buf, uint32(len(e.wrappedKey)))
	buf = append(buf, e.wrappedKey...)
	buf = append(buf, e.ciphertext...)

	return buf, nil
}

// unmarshalBinary decodes an envelope previously produced by marshalBinary.
func (e *envelope) unmarshalBinary(data []byte) error {
	if len(data) < 4 {
		return apperr.Internal("data too short")
	}

	nonceLen := int(binary.BigEndian.Uint32(data[:4]))
	data = data[4:]
	if len(data) < nonceLen {
		return apperr.Internal("data too short for nonce")
	}
	e.nonce = data[:nonceLen]
	data = data[nonceLen:]
	if len(data) < 4 {
		return apperr.Internal("data too short for wrapped key length")
	}

	wrappedKeyLen := int(binary.BigEndian.Uint32(data[:4]))
	data = data[4:]
	if len(data) < wrappedKeyLen {
		return apperr.Internal("data too short for wrapped key")
	}

	e.wrappedKey = data[:wrappedKeyLen]
	e.ciphertext = data[wrappedKeyLen:]

	return nil
}

// encryptAESGCM encrypts the given plaintext using AES-GCM with the provided
// key. It returns the ciphertext, which includes the encrypted payload, the
// nonce, and the authentication tag.
func encryptAESGCM(key, plaintext []byte) (ciphertext []byte, nonce []byte, err error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, nil, err
	}

	aesgcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, nil, err
	}

	// A random nonce is used. Because a duplicate nonce in the database 
	nonce = make([]byte, aesgcm.NonceSize())
	_, err = rand.Read(nonce)
	if err != nil {
		return nil, nil, err
	}

	dst := make([]byte, 0, len(plaintext)+aesgcm.Overhead())
	ciphertext = aesgcm.Seal(dst, nonce, plaintext, nil)
	return ciphertext, nonce, nil
}

func decryptAESGCM(key, nonce []byte, ciphertext []byte) (plaintext []byte, err error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	aesgcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	nonceSize := aesgcm.NonceSize()
	if len(nonce) != nonceSize {
		return nil, apperr.Internal("Invalid nonce size")
	}

	plaintext, err = aesgcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil, err
	}

	return plaintext, nil
}
