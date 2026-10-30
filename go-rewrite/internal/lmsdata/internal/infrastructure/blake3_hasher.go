package infrastructure

import (
	"encoding/hex"

	"rewritetest/internal/lmsdata/internal/domain"

	"lukechampine.com/blake3"
)

type Blake3ContentHasher struct{}

func NewBlake3ContentHasher() *Blake3ContentHasher {
	return &Blake3ContentHasher{}
}

func (h *Blake3ContentHasher) HashContent(content string) (string, error) {
	hash := blake3.Sum256([]byte(content))
	return hex.EncodeToString(hash[:]), nil
}

var _ domain.ContentHasher = (*Blake3ContentHasher)(nil)
