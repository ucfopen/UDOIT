package canvas

import (
	"context"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"
	"time"

	"rewritetest/internal/lms/internal/domain"
	"rewritetest/internal/shared/auth"
)

type fileUploadCredentialRepository struct {
	credential domain.LMSCredential
}

func (r fileUploadCredentialRepository) UpsertActive(context.Context, domain.LMSCredential) error {
	return nil
}

func (r fileUploadCredentialRepository) GetActiveByUser(context.Context, int64) (*domain.LMSCredential, error) {
	return &r.credential, nil
}

func TestBeginFileUploadNegotiatesCanvasUploadTarget(t *testing.T) {
	credential := domain.NewLMSCredential(
		17,
		domain.LMSTypeCanvas,
		map[string]any{
			"api_token":     "token",
			"refresh_token": "refresh",
		},
		nil,
		time.Now(),
	)

	type requestRecord struct {
		method string
		path   string
		query  url.Values
	}
	var requests []requestRecord

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requests = append(requests, requestRecord{
			method: r.Method,
			path:   r.URL.Path,
			query:  r.URL.Query(),
		})

		if r.Header.Get("Authorization") != "Bearer token" {
			t.Fatalf("expected bearer token, got %q", r.Header.Get("Authorization"))
		}

		switch r.URL.Path {
		case "/api/v1/courses/42/files/34":
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"folder_id": 8}`))
		case "/api/v1/courses/42/files":
			if r.Method != http.MethodPost {
				t.Fatalf("expected POST for upload negotiation, got %s", r.Method)
			}
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"upload_url":"https://uploads.example.test/target","upload_params":{"policy":"policy-value","success":"true"}}`))
		default:
			http.NotFound(w, r)
		}
	}))
	defer server.Close()

	provider := &CanvasLMSProvider{
		lmsCredentialRepository: fileUploadCredentialRepository{credential: credential},
		httpClient:              server.Client(),
		config: canvasConfig{
			baseURL:  server.URL,
			tenantID: 9,
		},
	}

	target, err := provider.BeginFileUpload(context.Background(), auth.Principal{
		AgentID:  17,
		TenantID: 9,
	}, domain.LMSCourse{
		ID:           1,
		ExternalID:   "course:1",
		ExternalData: map[string]any{"course_id": "42"},
	}, domain.CourseFile{
		FileName:     "old.pdf",
		ExternalData: map[string]any{"file_id": int64(34)},
	}, "new.pdf", 4096)
	if err != nil {
		t.Fatalf("BeginFileUpload returned error: %v", err)
	}

	if target.Method != http.MethodPost {
		t.Fatalf("expected POST target, got %q", target.Method)
	}
	if target.URL != "https://uploads.example.test/target" {
		t.Fatalf("unexpected upload URL: %q", target.URL)
	}
	if target.Fields["policy"] != "policy-value" || target.Fields["success"] != "true" {
		t.Fatalf("unexpected upload fields: %#v", target.Fields)
	}

	if len(requests) != 2 {
		t.Fatalf("expected two Canvas requests, got %d", len(requests))
	}
	if requests[0].method != http.MethodGet || requests[0].path != "/api/v1/courses/42/files/34" {
		t.Fatalf("unexpected file lookup request: %+v", requests[0])
	}
	if requests[1].path != "/api/v1/courses/42/files" {
		t.Fatalf("unexpected upload negotiation path: %+v", requests[1])
	}
	if requests[1].query.Get("name") != "new.pdf" || requests[1].query.Get("size") != "4096" || requests[1].query.Get("parent_folder_id") != "8" {
		t.Fatalf("unexpected negotiation query: %v", requests[1].query)
	}
}

func TestBeginFileUploadRejectsMalformedCanvasResponses(t *testing.T) {
	tests := []struct {
		name           string
		fileResponse   string
		uploadResponse string
		wantMessage    string
	}{
		{
			name:         "missing folder ID",
			fileResponse: `{"id":34}`,
			wantMessage:  "Canvas file is missing a valid folder ID",
		},
		{
			name:           "missing upload URL",
			fileResponse:   `{"folder_id":8}`,
			uploadResponse: `{"upload_params":{"policy":"value"}}`,
			wantMessage:    "Canvas upload target is missing upload URL",
		},
		{
			name:           "missing upload parameters",
			fileResponse:   `{"folder_id":8}`,
			uploadResponse: `{"upload_url":"https://uploads.example.test/target"}`,
			wantMessage:    "Canvas upload target is missing upload parameters",
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			credential := domain.NewLMSCredential(
				17,
				domain.LMSTypeCanvas,
				map[string]any{"api_token": "token", "refresh_token": "refresh"},
				nil,
				time.Now(),
			)
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				w.Header().Set("Content-Type", "application/json")
				switch r.URL.Path {
				case "/api/v1/courses/42/files/34":
					_, _ = w.Write([]byte(test.fileResponse))
				case "/api/v1/courses/42/files":
					_, _ = w.Write([]byte(test.uploadResponse))
				default:
					http.NotFound(w, r)
				}
			}))
			defer server.Close()

			provider := &CanvasLMSProvider{
				lmsCredentialRepository: fileUploadCredentialRepository{credential: credential},
				httpClient:              server.Client(),
				config:                  canvasConfig{baseURL: server.URL},
			}

			_, err := provider.BeginFileUpload(context.Background(), auth.Principal{AgentID: 17}, domain.LMSCourse{
				ExternalData: map[string]any{"course_id": "42"},
			}, domain.CourseFile{
				ExternalData: map[string]any{"file_id": int64(34)},
			}, "new.pdf", 4096)
			if err == nil || err.Error() != test.wantMessage {
				t.Fatalf("expected error %q, got %v", test.wantMessage, err)
			}
		})
	}
}

func TestCompleteFileUploadFetchesAndMapsAuthoritativeCanvasMetadata(t *testing.T) {
	credential := domain.NewLMSCredential(
		17,
		domain.LMSTypeCanvas,
		map[string]any{"api_token": "token", "refresh_token": "refresh"},
		nil,
		time.Now(),
	)
	var gotAuthorization string
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotAuthorization = r.Header.Get("Authorization")
		if r.URL.Path != "/api/v1/courses/42/files/55" {
			http.NotFound(w, r)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"id":55,"context_type":"Course","url":"https://canvas.example/files/55","display_name":"new.pdf","mime_class":"application/pdf","size":4096,"updated_at":"2026-10-23T12:00:00Z"}`))
	}))
	defer server.Close()

	provider := &CanvasLMSProvider{
		lmsCredentialRepository: fileUploadCredentialRepository{credential: credential},
		httpClient:              server.Client(),
		config:                  canvasConfig{baseURL: server.URL},
	}

	got, err := provider.CompleteFileUpload(context.Background(), auth.Principal{AgentID: 17}, domain.LMSCourse{
		ExternalData: map[string]any{"course_id": "42"},
	}, domain.CourseFile{
		ExternalData: map[string]any{"file_id": int64(34)},
	}, "new.pdf", map[string]any{"id": 55})
	if err != nil {
		t.Fatalf("CompleteFileUpload returned error: %v", err)
	}

	if gotAuthorization != "Bearer token" {
		t.Fatalf("expected bearer token, got %q", gotAuthorization)
	}
	if got.FileName != "new.pdf" || got.FileType != "application/pdf" || got.FileSize != 4096 {
		t.Fatalf("unexpected mapped file metadata: %+v", got)
	}
	if got.ExternalID != "file:55" || got.ExternalData["file_id"] != int64(55) {
		t.Fatalf("unexpected mapped external metadata: %+v", got)
	}
	if got.UpdatedAt.Format(time.RFC3339) != "2026-10-23T12:00:00Z" {
		t.Fatalf("unexpected updated timestamp: %s", got.UpdatedAt)
	}
}

func TestCompleteFileUploadRejectsUntrustedOrInvalidMetadata(t *testing.T) {
	tests := []struct {
		name           string
		uploadResponse map[string]any
		fileResponse   string
		wantMessage    string
	}{
		{
			name:           "missing uploaded ID",
			uploadResponse: map[string]any{},
			wantMessage:    "Canvas upload response is missing a valid file ID",
		},
		{
			name:           "authoritative ID mismatch",
			uploadResponse: map[string]any{"id": 55},
			fileResponse:   `{"id":56,"context_type":"Course","url":"https://canvas.example/files/56","display_name":"new.pdf","updated_at":"2026-10-23T12:00:00Z"}`,
			wantMessage:    "Uploaded Canvas file ID does not match the upload response",
		},
		{
			name:           "invalid timestamp",
			uploadResponse: map[string]any{"id": 55},
			fileResponse:   `{"id":55,"context_type":"Course","url":"https://canvas.example/files/55","display_name":"new.pdf","updated_at":"not-a-timestamp"}`,
			wantMessage:    "Uploaded Canvas file has an invalid updated timestamp",
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			credential := domain.NewLMSCredential(
				17,
				domain.LMSTypeCanvas,
				map[string]any{"api_token": "token", "refresh_token": "refresh"},
				nil,
				time.Now(),
			)
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				if test.fileResponse == "" {
					http.NotFound(w, r)
					return
				}
				w.Header().Set("Content-Type", "application/json")
				_, _ = w.Write([]byte(test.fileResponse))
			}))
			defer server.Close()

			provider := &CanvasLMSProvider{
				lmsCredentialRepository: fileUploadCredentialRepository{credential: credential},
				httpClient:              server.Client(),
				config:                  canvasConfig{baseURL: server.URL},
			}

			_, err := provider.CompleteFileUpload(context.Background(), auth.Principal{AgentID: 17}, domain.LMSCourse{
				ExternalData: map[string]any{"course_id": "42"},
			}, domain.CourseFile{
				ExternalData: map[string]any{"file_id": int64(34)},
			}, "new.pdf", test.uploadResponse)
			if err == nil || err.Error() != test.wantMessage {
				t.Fatalf("expected error %q, got %v", test.wantMessage, err)
			}
		})
	}
}
