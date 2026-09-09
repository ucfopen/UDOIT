package infrastructure

import (
	"encoding/hex"

	"lukechampine.com/blake3"
)

type Blake3ContentHasher struct{}

func NewBlake3ContentHasher() *Blake3ContentHasher {
	return &Blake3ContentHasher{}
}

func (h *Blake3ContentHasher) HashContent(content string) (string, error) {
	data := []byte(content)

	hash := blake3.Sum256(data)

	return hex.EncodeToString(hash[:]), nil
}
