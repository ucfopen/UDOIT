package canvas

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
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
	if requests[1].query.Get("name") != "new.pdf" || requests[1].query.Get("size") != "4096" || requests[1].query.Get("parent_folder_id") != "8" || requests[1].query.Get("on_duplicate") != "rename" {
		t.Fatalf("unexpected negotiation query: %v", requests[1].query)
	}
}

func TestCompleteFileUploadMapsCanvasMetadata(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.URL.Path == "/api/v1/courses/42/files/55":
			_, _ = w.Write([]byte(`{"id":55,"context_type":"Course","url":"https://canvas.example/files/55","display_name":"new.pdf","mime_class":"application/pdf","size":4096,"updated_at":"2026-10-23T12:00:00Z"}`))
		case r.URL.Path == "/api/v1/courses/42" && r.Method == http.MethodGet:
			_, _ = w.Write([]byte(`{"id":42,"syllabus_body":""}`))
		case r.URL.Path == "/api/v1/courses/42/files/34" && r.Method == http.MethodGet:
			_, _ = w.Write([]byte(`{"id":34,"folder_id":8,"display_name":"old.pdf"}`))
		case r.URL.Path == "/api/v1/courses/42/files/34" && r.Method == http.MethodGet:
			_, _ = w.Write([]byte(`{"id":34,"folder_id":8,"display_name":"old.pdf"}`))
		case strings.HasPrefix(r.URL.Path, "/api/v1/courses/42/pages") ||
			strings.HasPrefix(r.URL.Path, "/api/v1/courses/42/assignments") ||
			strings.HasPrefix(r.URL.Path, "/api/v1/courses/42/discussion_topics") ||
			strings.HasPrefix(r.URL.Path, "/api/v1/courses/42/quizzes") ||
			r.URL.Path == "/api/v1/courses/42/modules":
			_, _ = w.Write([]byte(`[]`))
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
	got, err := p.CompleteFileUpload(context.Background(), 17,
		provider.Course{ExternalData: map[string]any{"course_id": "42"}}, provider.File{ExternalData: map[string]any{"file_id": int64(34)}}, "new.pdf", map[string]any{"id": 55})
	if err != nil {
		t.Fatalf("CompleteFileUpload returned error: %v", err)
	}
	if got.FileName != "new.pdf" || got.FileType != "application/pdf" || got.FileSize != 4096 || got.ExternalID != "file:55" || got.ExternalData["file_id"] != int64(55) {
		t.Fatalf("unexpected uploaded file: %+v", got)
	}
}

func TestReplaceFileReferencesInHTMLUpdatesCanvasAttributesOnly(t *testing.T) {
	original := `<p><a href="https://canvas.example/courses/42/files/34/download?wrap=1" data-api-endpoint="https://canvas.example/api/v1/courses/42/files/34"><strong>old.pdf</strong></a><img src="/files/340/preview"><a href="/files/34">Download the reading</a></p>`
	updated, changed, err := replaceFileReferencesInHTML(original, "34", "55", "old.pdf", "new.pdf")
	if err != nil {
		t.Fatalf("replaceFileReferencesInHTML returned error: %v", err)
	}
	if !changed {
		t.Fatal("expected Canvas file references to change")
	}
	for _, expected := range []string{
		"/courses/42/files/55/download?wrap=1",
		"/api/v1/courses/42/files/55",
		`src="/files/340/preview"`,
		`href="/files/55"`,
		"<strong>new.pdf</strong>",
		"Download the reading",
	} {
		if !strings.Contains(updated, expected) {
			t.Errorf("updated HTML %q does not contain %q", updated, expected)
		}
	}
}

func TestReplaceFileReferencesInHTMLRenamesOnlyExactDefaultLabels(t *testing.T) {
	original := `<div><a href="/files/34/download"><strong>old.pdf</strong></a><a href="/files/34/download">Open old.pdf in a new tab</a><a href="/files/99/download"><strong>old.pdf</strong></a></div>`
	updated, changed, err := replaceFileReferencesInHTML(original, "34", "55", "old.pdf", "new.pdf")
	if err != nil {
		t.Fatalf("replaceFileReferencesInHTML returned error: %v", err)
	}
	if !changed {
		t.Fatal("expected file reference to change")
	}
	for _, expected := range []string{
		"<strong>new.pdf</strong>",
		"Open old.pdf in a new tab",
		`href="/files/99/download"><strong>old.pdf</strong>`,
	} {
		if !strings.Contains(updated, expected) {
			t.Errorf("updated HTML %q does not contain %q", updated, expected)
		}
	}
}

func TestCompleteFileUploadReplacesRichTextAndModuleFileReferences(t *testing.T) {
	var pageUpdateBody map[string]any
	var createdModuleItemTitles []string
	deletedOldModuleItems := 0
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.URL.Path == "/api/v1/courses/42/files/55" && r.Method == http.MethodGet:
			_, _ = w.Write([]byte(`{"id":55,"url":"https://canvas.example/files/55/download","display_name":"new.pdf","mime_class":"application/pdf","size":4096,"updated_at":"2026-10-23T12:00:00Z"}`))
		case r.URL.Path == "/api/v1/courses/42/files/34" && r.Method == http.MethodGet:
			_, _ = w.Write([]byte(`{"id":34,"folder_id":8,"display_name":"old.pdf"}`))
		case r.URL.Path == "/api/v1/courses/42" && r.Method == http.MethodGet:
			_, _ = w.Write([]byte(`{"id":42,"syllabus_body":"<p>nothing here</p>"}`))
		case r.URL.Path == "/api/v1/courses/42/pages" && r.Method == http.MethodGet:
			_, _ = w.Write([]byte(`[{"page_id":7,"url":"welcome","body":"<a href=\"/courses/42/files/34/download\">old file</a>"}]`))
		case r.URL.Path == "/api/v1/courses/42/pages/page_id:7" && r.Method == http.MethodPut:
			if err := json.NewDecoder(r.Body).Decode(&pageUpdateBody); err != nil {
				t.Errorf("decode page update: %v", err)
			}
			w.WriteHeader(http.StatusOK)
		case r.URL.Path == "/api/v1/courses/42/assignments" && r.Method == http.MethodGet:
			_, _ = w.Write([]byte(`[]`))
		case r.URL.Path == "/api/v1/courses/42/discussion_topics" && r.Method == http.MethodGet:
			_, _ = w.Write([]byte(`[]`))
		case r.URL.Path == "/api/v1/courses/42/discussion_topics" && r.URL.Query().Get("only_announcements") == "true" && r.Method == http.MethodGet:
			_, _ = w.Write([]byte(`[]`))
		case r.URL.Path == "/api/v1/courses/42/quizzes" && r.Method == http.MethodGet:
			_, _ = w.Write([]byte(`[]`))
		case r.URL.Path == "/api/v1/courses/42/modules" && r.Method == http.MethodGet:
			_, _ = w.Write([]byte(`[{"id":9,"items":[{"id":12,"module_id":9,"position":2,"title":"old.pdf","indent":1,"type":"File","content_id":34,"completion_requirement":{"type":"must_view"}},{"id":13,"module_id":9,"position":3,"title":"Custom reading title","indent":0,"type":"File","content_id":34}]}]`))
		case r.URL.Path == "/api/v1/courses/42/modules/9/items" && r.Method == http.MethodPost:
			var requestBody map[string]any
			if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
				t.Errorf("decode new module item: %v", err)
			}
			moduleItem, _ := requestBody["module_item"].(map[string]any)
			createdModuleItemTitles = append(createdModuleItemTitles, moduleItem["title"].(string))
			if moduleItem["content_id"] != "55" {
				t.Errorf("new module item points to wrong file: %#v", moduleItem)
			}
			w.WriteHeader(http.StatusCreated)
		case strings.HasPrefix(r.URL.Path, "/api/v1/courses/42/modules/9/items/") && r.Method == http.MethodDelete:
			deletedOldModuleItems++
			w.WriteHeader(http.StatusOK)
		default:
			http.NotFound(w, r)
		}
	}))
	defer server.Close()
	repositories := &authTestRepositories{credential: record.LMSCredential{UserID: 17, LMSKey: "canvas", Payload: map[string]any{"api_token": "access", "refresh_token": "refresh"}}}
	p, err := New(map[string]any{"base_url": server.URL, "client_id": "id", "client_secret": "secret"}, "", repositories, repositories)
	if err != nil {
		t.Fatal(err)
	}
	p.(*Canvas).httpClient = server.Client()
	_, err = p.CompleteFileUpload(context.Background(), 17,
		provider.Course{ExternalData: map[string]any{"course_id": "42"}},
		provider.File{ExternalData: map[string]any{"file_id": int64(34)}}, "new.pdf", map[string]any{"id": 55})
	if err != nil {
		t.Fatalf("CompleteFileUpload returned error: %v", err)
	}
	page, ok := pageUpdateBody["wiki_page"].(map[string]any)
	if !ok || !strings.Contains(page["body"].(string), "/files/55/download") {
		t.Fatalf("page did not reference replacement file: %#v", pageUpdateBody)
	}
	if len(createdModuleItemTitles) != 2 {
		t.Fatalf("expected both module file items to be recreated, got titles %#v", createdModuleItemTitles)
	}
	if !containsString(createdModuleItemTitles, "new.pdf") || !containsString(createdModuleItemTitles, "Custom reading title") {
		t.Fatalf("module item titles were not updated selectively: %#v", createdModuleItemTitles)
	}
	if deletedOldModuleItems != 2 {
		t.Fatalf("expected both old module file items to be removed, got %d", deletedOldModuleItems)
	}
}

func containsString(values []string, wanted string) bool {
	for _, value := range values {
		if value == wanted {
			return true
		}
	}
	return false
}
