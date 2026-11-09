package canvas

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"rewritetest/internal/lms/internal/record"
	"rewritetest/internal/lms/internal/storage"
)

func newReplacementTestCanvas(t *testing.T, server *httptest.Server) *Canvas {
	t.Helper()
	repositories := &storage.MockRepositories{Credential: record.LMSCredential{
		UserID: 17,
		LMSKey: "canvas",
		Payload: map[string]any{
			"api_token":     "access",
			"refresh_token": "refresh",
		},
	}}
	provider, err := New(map[string]any{
		"base_url":      server.URL,
		"client_id":     "client",
		"client_secret": "secret",
	}, "", repositories, repositories)
	if err != nil {
		t.Fatalf("create Canvas provider: %v", err)
	}
	canvasProvider := provider.(*Canvas)
	canvasProvider.httpClient = server.Client()
	return canvasProvider
}

func TestReplaceCourseFileReferencesUpdatesCanvasRichText(t *testing.T) {
	updatedPaths := make(map[string]string)
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		switch {
		case path == "/api/v1/courses/42" && r.Method == http.MethodGet:
			_, _ = w.Write([]byte(`{"id":42,"syllabus_body":"<a href=\"/files/34/download\">syllabus</a>"}`))
		case path == "/api/v1/courses/42" && r.Method == http.MethodPut:
			updatedPaths["syllabus"] = requestBodyString(t, r, "course", "syllabus_body")
			w.WriteHeader(http.StatusOK)
		case path == "/api/v1/courses/42/pages" && r.Method == http.MethodGet:
			_, _ = w.Write([]byte(`[{"page_id":7,"url":"welcome","body":"<a href=\"/files/34/download\">page</a>"}]`))
		case path == "/api/v1/courses/42/pages/page_id:7" && r.Method == http.MethodPut:
			updatedPaths["page"] = requestBodyString(t, r, "wiki_page", "body")
			w.WriteHeader(http.StatusOK)
		case path == "/api/v1/courses/42/assignments" && r.Method == http.MethodGet:
			_, _ = w.Write([]byte(`[{"id":8,"description":"<img src=\"/courses/42/files/34/preview\">"}]`))
		case path == "/api/v1/courses/42/assignments/8" && r.Method == http.MethodPut:
			updatedPaths["assignment"] = requestBodyString(t, r, "assignment", "description")
			w.WriteHeader(http.StatusOK)
		case path == "/api/v1/courses/42/discussion_topics" && r.URL.Query().Get("only_announcements") != "true" && r.Method == http.MethodGet:
			_, _ = w.Write([]byte(`[{"id":9,"message":"<a href=\"/courses/42/files/34/download\">discussion</a>","is_announcement":false}]`))
		case path == "/api/v1/courses/42/discussion_topics/9" && r.Method == http.MethodPut:
			updatedPaths["discussion"] = requestBodyString(t, r, "", "message")
			w.WriteHeader(http.StatusOK)
		case path == "/api/v1/courses/42/discussion_topics" && r.URL.Query().Get("only_announcements") == "true" && r.Method == http.MethodGet:
			_, _ = w.Write([]byte(`[{"id":10,"message":"<a href=\"/courses/42/files/34/download\">announcement</a>"}]`))
		case path == "/api/v1/courses/42/discussion_topics/10" && r.Method == http.MethodPut:
			updatedPaths["announcement"] = requestBodyString(t, r, "", "message")
			w.WriteHeader(http.StatusOK)
		case path == "/api/v1/courses/42/quizzes" && r.Method == http.MethodGet:
			_, _ = w.Write([]byte(`[{"id":11,"description":"<a href=\"/files/34/download\">quiz</a>"}]`))
		case path == "/api/v1/courses/42/quizzes/11" && r.Method == http.MethodPut:
			updatedPaths["quiz"] = requestBodyString(t, r, "quiz", "description")
			w.WriteHeader(http.StatusOK)
		case path == "/api/v1/courses/42/quizzes/11/questions" && r.Method == http.MethodGet:
			_, _ = w.Write([]byte(`[{"id":12,"quiz_id":11,"question_text":"<a href=\"/files/34/download\">question</a>"}]`))
		case path == "/api/v1/courses/42/quizzes/11/questions/12" && r.Method == http.MethodPut:
			updatedPaths["quiz question"] = requestBodyString(t, r, "question", "question_text")
			w.WriteHeader(http.StatusOK)
		case path == "/api/v1/courses/42/modules" && r.Method == http.MethodGet:
			_, _ = w.Write([]byte(`[]`))
		default:
			http.NotFound(w, r)
		}
	}))
	defer server.Close()

	canvasProvider := newReplacementTestCanvas(t, server)
	if err := canvasProvider.replaceCourseFileReferences(context.Background(), 17, "42", "34", "55", "old.pdf", "new.pdf"); err != nil {
		t.Fatalf("replaceCourseFileReferences returned error: %v", err)
	}
	if len(updatedPaths) != 7 {
		t.Fatalf("expected seven Canvas content updates; got %d: %#v", len(updatedPaths), updatedPaths)
	}
	for contentType, body := range updatedPaths {
		if !strings.Contains(body, "/files/55/") {
			t.Errorf("%s content did not link the replacement file: %q", contentType, body)
		}
	}
}

func TestReplacePageFileReferencesFollowsCanvasPagination(t *testing.T) {
	updatedPages := 0
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.URL.Path == "/api/v1/courses/42/pages" && r.URL.Query().Get("page") != "2":
			w.Header().Set("Link", "<"+serverURLForPageTwo(r)+">; rel=\"next\"")
			_, _ = w.Write([]byte(`[{"page_id":7,"url":"first","body":"<a href=\"/files/34/download\">first</a>"}]`))
		case r.URL.Path == "/api/v1/courses/42/pages" && r.URL.Query().Get("page") == "2":
			_, _ = w.Write([]byte(`[{"page_id":8,"url":"second","body":"<a href=\"/files/34/download\">second</a>"}]`))
		case strings.HasPrefix(r.URL.Path, "/api/v1/courses/42/pages/page_id:") && r.Method == http.MethodPut:
			updatedPages++
			w.WriteHeader(http.StatusOK)
		default:
			http.NotFound(w, r)
		}
	}))
	defer server.Close()

	canvasProvider := newReplacementTestCanvas(t, server)
	if err := canvasProvider.replacePageFileReferences(context.Background(), 17, "42", "34", "55", "old.pdf", "new.pdf"); err != nil {
		t.Fatalf("replacePageFileReferences returned error: %v", err)
	}
	if updatedPages != 2 {
		t.Fatalf("expected both paginated pages to be updated, got %d", updatedPages)
	}
}

func TestReplacePageFileReferencesReturnsCanvasUpdateFailure(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.URL.Path == "/api/v1/courses/42/pages":
			_, _ = w.Write([]byte(`[{"page_id":7,"url":"welcome","body":"<a href=\"/files/34/download\">old file</a>"}]`))
		case r.URL.Path == "/api/v1/courses/42/pages/page_id:7" && r.Method == http.MethodPut:
			http.Error(w, "permission denied", http.StatusForbidden)
		default:
			http.NotFound(w, r)
		}
	}))
	defer server.Close()

	canvasProvider := newReplacementTestCanvas(t, server)
	err := canvasProvider.replacePageFileReferences(context.Background(), 17, "42", "34", "55", "old.pdf", "new.pdf")
	if err == nil || !strings.Contains(err.Error(), "update page") || !strings.Contains(err.Error(), "permission denied") {
		t.Fatalf("expected contextual Canvas update error, got %v", err)
	}
}

func requestBodyString(t *testing.T, request *http.Request, parentKey, field string) string {
	t.Helper()
	var body map[string]any
	if err := json.NewDecoder(request.Body).Decode(&body); err != nil {
		t.Fatalf("decode Canvas request body: %v", err)
	}
	if parentKey != "" {
		parent, ok := body[parentKey].(map[string]any)
		if !ok {
			t.Fatalf("request body missing %q object: %#v", parentKey, body)
		}
		body = parent
	}
	value, ok := body[field].(string)
	if !ok {
		t.Fatalf("request body missing string field %q: %#v", field, body)
	}
	return value
}

func serverURLForPageTwo(request *http.Request) string {
	return fmt.Sprintf("http://%s/api/v1/courses/42/pages?page=2", request.Host)
}
