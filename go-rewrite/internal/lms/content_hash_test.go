package lms

import "testing"

func TestHashLMSContent(t *testing.T) {
	if got, want := hashLMSContent("content"), "3fba5250be9ac259c56e7250c526bc83bacb4be825f2799d3d59e5b4878dd74e"; got != want {
		t.Fatalf("hashLMSContent() = %q, want %q", got, want)
	}
}
