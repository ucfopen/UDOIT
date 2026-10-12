package infrastructure

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestBlake3ContentHasher_HashContent(t *testing.T) {
	hasher := NewBlake3ContentHasher()

	hash, err := hasher.HashContent("content")

	require.NoError(t, err)
	require.Equal(t, "3fba5250be9ac259c56e7250c526bc83bacb4be825f2799d3d59e5b4878dd74e", hash)
}
