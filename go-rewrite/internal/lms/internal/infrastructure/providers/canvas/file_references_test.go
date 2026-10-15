package canvas

import (
	"context"
	"testing"

	"rewritetest/internal/lms/internal/domain"
)

func TestResolveFileReferencesResolvesSupportedCanvasFileURLs(t *testing.T) {
	provider := &CanvasLMSProvider{}
	refs := []domain.ContentReference{
		{
			ContentExternalID: "page:welcome",
			Kind:              "link",
			TagName:           "a",
			Attribute:         "href",
			Value:             "https://canvas.example/files/34",
			XPath:             "/html[1]/body[1]/a[1]",
		},
		{
			ContentExternalID: "page:welcome",
			Kind:              "iframe",
			TagName:           "iframe",
			Attribute:         "src",
			Value:             "https://canvas.example/files/35?download=1",
			XPath:             "/html[1]/body[1]/iframe[1]",
		},
	}
	files := []domain.CourseFile{
		{
			ExternalID:   "file:34",
			ExternalData: map[string]any{"file_id": int64(34)},
		},
		{
			ExternalID:   "file:35",
			ExternalData: map[string]any{"file_id": int64(35)},
		},
	}

	resolved, err := provider.ResolveFileReferences(context.Background(), domain.LMSCourse{}, refs, files)
	if err != nil {
		t.Fatalf("ResolveFileReferences returned error: %v", err)
	}

	if len(resolved) != 2 {
		t.Fatalf("expected two resolved references, got %d", len(resolved))
	}
	if resolved[0].ContentExternalID != "page:welcome" || resolved[0].FileExternalID != "file:34" {
		t.Fatalf("unexpected first resolved reference: %+v", resolved[0])
	}
	if resolved[1].ContentExternalID != "page:welcome" || resolved[1].FileExternalID != "file:35" {
		t.Fatalf("unexpected second resolved reference: %+v", resolved[1])
	}
}

func TestResolveFileReferencesDropsUnknownAndDuplicateReferences(t *testing.T) {
	provider := &CanvasLMSProvider{}
	refs := []domain.ContentReference{
		{ContentExternalID: "page:welcome", Value: "https://canvas.example/files/34"},
		{ContentExternalID: "page:welcome", Value: "https://canvas.example/files/34"},
		{ContentExternalID: "page:welcome", Value: "https://canvas.example/files/999"},
		{ContentExternalID: "page:welcome", Value: "https://canvas.example/courses/1"},
	}
	files := []domain.CourseFile{{
		ExternalID:   "file:34",
		ExternalData: map[string]any{"file_id": int64(34)},
	}}

	resolved, err := provider.ResolveFileReferences(context.Background(), domain.LMSCourse{}, refs, files)
	if err != nil {
		t.Fatalf("ResolveFileReferences returned error: %v", err)
	}

	if len(resolved) != 1 || resolved[0].FileExternalID != "file:34" {
		t.Fatalf("expected one unique known reference, got %+v", resolved)
	}
}
