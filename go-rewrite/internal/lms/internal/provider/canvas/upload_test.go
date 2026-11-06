package canvas

import (
	"context"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"

	"rewritetest/internal/lms/internal/provider"
	"rewritetest/internal/lms/internal/record"
)

func TestBeginFileUploadNegotiatesCanvasUploadTarget(t *testing.T) {
	type requestRecord struct {
		method, path string
		query        url.Values
	}
	var requests []requestRecord
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requests = append(requests, requestRecord{r.Method, r.URL.Path, r.URL.Query()})
		switch r.URL.Path {
		case "/api/v1/courses/42/files/34":
			_, _ = w.Write([]byte(`{"folder_id":8}`))
		case "/api/v1/courses/42/files":
			_, _ = w.Write([]byte(`{"upload_url":"https://uploads.example.test/target","upload_params":{"policy":"policy-value","success":"true"}}`))
		default:
			http.NotFound(w, r)
		}
	}))
	defer server.Close()
	config := map[string]any{"base_url": server.URL, "client_id": "id", "client_secret": "secret"}
	repositories := &authTestRepositories{credential: record.LMSCredential{UserID: 17, LMSKey: "canvas", Payload: map[string]any{"api_token": "access", "refresh_token": "refresh"}}}
	p, err := New(config, "", repositories, repositories)
	if err != nil {
		t.Fatal(err)
	}
	p.(*Canvas).httpClient = server.Client()
	target, err := p.BeginFileUpload(context.Background(), 17,
		provider.Course{ExternalData: map[string]any{"course_id": "42"}},
		provider.File{ExternalData: map[string]any{"file_id": int64(34)}}, "new.pdf", 4096)
	if err != nil {
		t.Fatalf("BeginFileUpload returned error: %v", err)
	}
	if target.Method != http.MethodPost || target.URL != "https://uploads.example.test/target" {
		t.Fatalf("unexpected target: %+v", target)
	}
	if target.Fields["policy"] != "policy-value" || target.Fields["success"] != "true" {
		t.Fatalf("unexpected fields: %#v", target.Fields)
	}
	if len(requests) != 2 || requests[0].path != "/api/v1/courses/42/files/34" || requests[1].method != http.MethodPost || requests[1].path != "/api/v1/courses/42/files" {
		t.Fatalf("unexpected Canvas calls: %+v", requests)
	}
	if requests[1].query.Get("name") != "new.pdf" || requests[1].query.Get("size") != "4096" || requests[1].query.Get("parent_folder_id") != "8" {
		t.Fatalf("unexpected negotiation query: %v", requests[1].query)
	}
}

func TestCompleteFileUploadMapsCanvasMetadata(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/v1/courses/42/files/55" {
			http.NotFound(w, r)
			return
		}
		_, _ = w.Write([]byte(`{"id":55,"context_type":"Course","url":"https://canvas.example/files/55","display_name":"new.pdf","mime_class":"application/pdf","size":4096,"updated_at":"2026-10-23T12:00:00Z"}`))
	}))
	defer server.Close()
	config := map[string]any{"base_url": server.URL, "client_id": "id", "client_secret": "secret"}
	repositories := &authTestRepositories{credential: record.LMSCredential{UserID: 17, LMSKey: "canvas", Payload: map[string]any{"api_token": "access", "refresh_token": "refresh"}}}
	p, err := New(config, "", repositories, repositories)
	if err != nil {
		t.Fatal(err)
	}
	p.(*Canvas).httpClient = server.Client()
	got, err := p.CompleteFileUpload(context.Background(), 17,
		provider.Course{ExternalData: map[string]any{"course_id": "42"}}, provider.File{ExternalData: map[string]any{"file_id": int64(34)}}, "new.pdf", map[string]any{"id": 55})
	if err != nil {
		t.Fatalf("CompleteFileUpload returned error: %v", err)
	}
	if got.FileName != "new.pdf" || got.FileType != "application/pdf" || got.FileSize != 4096 || got.ExternalID != "file:55" || got.ExternalData["file_id"] != int64(55) {
		t.Fatalf("unexpected uploaded file: %+v", got)
	}
}
