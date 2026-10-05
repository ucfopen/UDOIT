package infrastructure

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"rewritetest/internal/accessibility/internal/domain"
)

func TestEqualAccessScannerReturnsCompleteReferences(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{
			"results": [],
			"references": [{
				"contentItemId": 12,
				"kind": "iframe",
				"tagName": "iframe",
				"attribute": "src",
				"value": "https://canvas.example/files/34",
				"xpath": "/html[1]/body[1]/iframe[1]"
			}]
		}`))
	}))
	defer server.Close()

	scanner := NewEqualAccessScanner(server.Client(), server.URL)
	result, err := scanner.ScanContent(context.Background(), []domain.ScanItem{{
		ContentItemID: 12,
		HTML:          `<iframe src="https://canvas.example/files/34"></iframe>`,
	}})
	if err != nil {
		t.Fatalf("ScanContent returned error: %v", err)
	}

	if len(result.References) != 1 {
		t.Fatalf("expected one reference, got %d", len(result.References))
	}

	got := result.References[0]
	if got.ContentItemID != 12 || got.Kind != "iframe" || got.TagName != "iframe" || got.Attribute != "src" || got.Value != "https://canvas.example/files/34" || got.XPath != "/html[1]/body[1]/iframe[1]" {
		t.Fatalf("reference fields were not preserved: %+v", got)
	}
}
