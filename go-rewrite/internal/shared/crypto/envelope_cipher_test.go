package crypto

import (
	"context"
	"encoding/binary"
	"errors"
	"testing"

	"github.com/stretchr/testify/require"
)

type mockKeyManager struct {
	wrapFn   func(ctx context.Context, keyID string, plaintextDEK []byte) ([]byte, error)
	unwrapFn func(ctx context.Context, keyID string, encryptedDEK []byte) ([]byte, error)
}

func (m *mockKeyManager) WrapKey(ctx context.Context, keyID string, plaintextDEK []byte) ([]byte, error) {
	if m.wrapFn == nil {
		return nil, errors.New("wrapFn is not configured")
	}

	return m.wrapFn(ctx, keyID, plaintextDEK)
}

func (m *mockKeyManager) UnwrapKey(ctx context.Context, keyID string, encryptedDEK []byte) ([]byte, error) {
	if m.unwrapFn == nil {
		return nil, errors.New("unwrapFn is not configured")
	}

	return m.unwrapFn(ctx, keyID, encryptedDEK)
}

func TestEnvelopeCipherEncryptDecryptRoundTrip(t *testing.T) {
	t.Parallel()

	var wrappedDEK []byte
	km := &mockKeyManager{}
	km.wrapFn = func(ctx context.Context, keyID string, plaintextDEK []byte) ([]byte, error) {
		wrappedDEK = append([]byte{}, plaintextDEK...)
		return append([]byte("wrapped:"), plaintextDEK...), nil
	}
	km.unwrapFn = func(ctx context.Context, keyID string, encryptedDEK []byte) ([]byte, error) {
		require.Equal(t, "tenant-key-1", keyID)
		require.Equal(t, append([]byte("wrapped:"), wrappedDEK...), encryptedDEK)
		return append([]byte{}, wrappedDEK...), nil
	}

	c := NewEnvelopeCipher(km, "tenant-key-1")
	plaintext := []byte(`{"x":"y","n":7}`)

	blob, err := c.Encrypt(context.Background(), plaintext)
	require.NoError(t, err)
	require.Equal(t, "tenant-key-1", blob.KeyID)
	require.NotEmpty(t, blob.Data)

	got, err := c.Decrypt(context.Background(), blob)
	require.NoError(t, err)
	require.Equal(t, plaintext, got)
}

func TestEnvelopeCipherEncryptCallsWrapKeyWithCurrentKeyIDAndDEK(t *testing.T) {
	t.Parallel()

	called := false
	km := &mockKeyManager{}
	km.wrapFn = func(ctx context.Context, keyID string, plaintextDEK []byte) ([]byte, error) {
		called = true
		require.Equal(t, "key-current", keyID)
		require.Len(t, plaintextDEK, 32)
		return append([]byte("wrapped:"), plaintextDEK...), nil
	}
	km.unwrapFn = func(ctx context.Context, keyID string, encryptedDEK []byte) ([]byte, error) {
		if len(encryptedDEK) < len("wrapped:") {
			return nil, errors.New("wrapped key too short")
		}
		return append([]byte{}, encryptedDEK[len("wrapped:"):]...), nil
	}

	c := NewEnvelopeCipher(km, "key-current")
	_, err := c.Encrypt(context.Background(), []byte("hello"))
	require.NoError(t, err)
	require.True(t, called)
}

func TestEnvelopeCipherDecryptUsesBlobKeyIDForUnwrap(t *testing.T) {
	t.Parallel()

	seenKeyID := ""
	var dek []byte
	km := &mockKeyManager{}
	km.wrapFn = func(ctx context.Context, keyID string, plaintextDEK []byte) ([]byte, error) {
		dek = append([]byte{}, plaintextDEK...)
		return append([]byte("wrapped:"), plaintextDEK...), nil
	}
	km.unwrapFn = func(ctx context.Context, keyID string, encryptedDEK []byte) ([]byte, error) {
		seenKeyID = keyID
		return append([]byte{}, dek...), nil
	}

	c := NewEnvelopeCipher(km, "key-current")
	blob, err := c.Encrypt(context.Background(), []byte("abc"))
	require.NoError(t, err)

	blob.KeyID = "key-old"
	_, err = c.Decrypt(context.Background(), blob)
	require.NoError(t, err)
	require.Equal(t, "key-old", seenKeyID)
}

func TestEnvelopeCipherDecryptFailsOnTamperedCiphertext(t *testing.T) {
	t.Parallel()

	var dek []byte
	km := &mockKeyManager{}
	km.wrapFn = func(ctx context.Context, keyID string, plaintextDEK []byte) ([]byte, error) {
		dek = append([]byte{}, plaintextDEK...)
		return append([]byte("wrapped:"), plaintextDEK...), nil
	}
	km.unwrapFn = func(ctx context.Context, keyID string, encryptedDEK []byte) ([]byte, error) {
		return append([]byte{}, dek...), nil
	}

	c := NewEnvelopeCipher(km, "key-1")
	blob, err := c.Encrypt(context.Background(), []byte("secret-message"))
	require.NoError(t, err)

	var env envelope
	require.NoError(t, env.unmarshalBinary(blob.Data))
	require.NotEmpty(t, env.ciphertext)

	env.ciphertext[0] ^= 0xFF
	blob.Data, err = env.marshalBinary()
	require.NoError(t, err)

	_, err = c.Decrypt(context.Background(), blob)
	require.Error(t, err)
}

func TestEnvelopeCipherDecryptFailsWhenUnwrapFails(t *testing.T) {
	t.Parallel()

	km := &mockKeyManager{}
	km.wrapFn = func(ctx context.Context, keyID string, plaintextDEK []byte) ([]byte, error) {
		return append([]byte("wrapped:"), plaintextDEK...), nil
	}
	km.unwrapFn = func(ctx context.Context, keyID string, encryptedDEK []byte) ([]byte, error) {
		return nil, errors.New("kms unavailable")
	}

	c := NewEnvelopeCipher(km, "key-1")
	blob, err := c.Encrypt(context.Background(), []byte("hello"))
	require.NoError(t, err)

	_, err = c.Decrypt(context.Background(), blob)
	require.Error(t, err)
	require.ErrorContains(t, err, "kms unavailable")
}

func TestEnvelopeUnmarshalBinaryInvalidInputs(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		data []byte
	}{
		{
			name: "too short for nonce length",
			data: []byte{0x00, 0x01, 0x02},
		},
		{
			name: "nonce length larger than remaining",
			data: func() []byte {
				buf := make([]byte, 4)
				binary.BigEndian.PutUint32(buf, 10)
				return buf
			}(),
		},
		{
			name: "missing wrapped key length after nonce",
			data: func() []byte {
				buf := make([]byte, 0, 5)
				buf = binary.BigEndian.AppendUint32(buf, 1)
				buf = append(buf, 0xAA)
				return buf
			}(),
		},
		{
			name: "wrapped key length larger than remaining",
			data: func() []byte {
				buf := make([]byte, 0, 9)
				buf = binary.BigEndian.AppendUint32(buf, 0)
				buf = binary.BigEndian.AppendUint32(buf, 20)
				buf = append(buf, 0x01)
				return buf
			}(),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			var env envelope
			require.Error(t, env.unmarshalBinary(tt.data))
		})
	}
}

func TestEnvelopeMarshalUnmarshalRoundTrip(t *testing.T) {
	t.Parallel()

	original := envelope{
		nonce:      []byte{1, 2, 3, 4},
		wrappedKey: []byte{5, 6, 7},
		ciphertext: []byte{8, 9, 10, 11, 12},
	}

	data, err := original.marshalBinary()
	require.NoError(t, err)

	var decoded envelope
	err = decoded.unmarshalBinary(data)
	require.NoError(t, err)
	require.Equal(t, original.nonce, decoded.nonce)
	require.Equal(t, original.wrappedKey, decoded.wrappedKey)
	require.Equal(t, original.ciphertext, decoded.ciphertext)
}
