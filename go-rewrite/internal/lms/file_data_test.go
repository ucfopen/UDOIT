package lms_test

import (
	"context"
	"testing"

	"rewritetest/internal/lms"
	"rewritetest/internal/lms/internal/provider"
	"rewritetest/internal/lms/internal/storage"
)

func TestCreateReplacementFileRetainsReplacementMarkerAcrossSync(t *testing.T) {
	store := storage.NewMapMockStore()
	service, err := lms.NewService(lms.Config{
		Store:        store,
		AuthAttempts: &storage.MockRepositories{},
		ProviderFactories: map[string]provider.Factory{
			"test": func(map[string]any, string, provider.CredentialRepository, provider.AuthAttemptRepository) (provider.Provider, error) {
				return nil, nil
			},
		},
	})
	if err != nil {
		t.Fatalf("NewService returned error: %v", err)
	}

	replacement, err := service.CreateReplacementFile(context.Background(), 12, lms.UploadedFile{
		FileName: "accessible.pdf", ExternalID: "file:55",
	})
	if err != nil {
		t.Fatalf("CreateReplacementFile returned error: %v", err)
	}
	if !replacement.IsReplacement {
		t.Fatalf("replacement marker was not set: %+v", replacement)
	}

	if err = service.SyncFilesForCourse(context.Background(), 12, []lms.FileSyncInput{{
		FileName: "accessible.pdf", ExternalID: "file:55",
	}}); err != nil {
		t.Fatalf("SyncFilesForCourse returned error: %v", err)
	}
	files, err := service.GetFilesByCourse(context.Background(), 12)
	if err != nil {
		t.Fatalf("GetFilesByCourse returned error: %v", err)
	}
	if len(files) != 1 || !files[0].IsReplacement {
		t.Fatalf("replacement marker should survive LMS sync, got %+v", files)
	}
}
