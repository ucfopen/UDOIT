package lms_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"rewritetest/internal/lms"
	"rewritetest/internal/lms/internal/provider"
	canvasprovider "rewritetest/internal/lms/internal/provider/canvas"
	"rewritetest/internal/lms/internal/record"
	"rewritetest/internal/lms/internal/storage"
	"rewritetest/internal/shared/auth"
)

func TestUpdateContentHTMLSendsHTMLToCanvasContentItem(t *testing.T) {
	const expectedHTML = `<main><h1>Updated page</h1></main>`
	updatedHTML := ""
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPut || r.URL.Path != "/api/v1/courses/42/pages/page_id:7" {
			t.Errorf("unexpected Canvas request: %s %s", r.Method, r.URL.Path)
			http.NotFound(w, r)
			return
		}
		var body struct {
			WikiPage struct {
				Body string `json:"body"`
			} `json:"wiki_page"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			t.Errorf("decode Canvas update: %v", err)
			http.Error(w, "invalid JSON", http.StatusBadRequest)
			return
		}
		updatedHTML = body.WikiPage.Body
		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	store := &storage.MockStore{
		ContentByIDFunc: func(_ context.Context, id int64) (record.Content, bool, error) {
			return record.Content{ID: id, CourseID: 12, ExternalID: "page:welcome", ExternalData: map[string]any{
				"content_id": 7, "content_type": "page", "updated_at": "2026-10-23T12:00:00Z",
			}}, true, nil
		},
		CourseByIDFunc: func(_ context.Context, id int64) (record.Course, bool, error) {
			return record.Course{ID: id, TenantID: 7, ExternalID: "course:42", ExternalData: map[string]any{"course_id": "42"}}, true, nil
		},
		ProviderConfigurationFunc: func(_ context.Context, tenantID int64) (record.ProviderConfiguration, bool, error) {
			return record.ProviderConfiguration{TenantID: tenantID, LMSKey: "canvas", Data: map[string]any{
				"base_url": server.URL, "client_id": "client", "client_secret": "secret",
			}}, true, nil
		},
		ActiveCredentialFunc: func(_ context.Context, userID int64) (record.LMSCredential, bool, error) {
			credential := record.LMSCredential{UserID: 17, LMSKey: "canvas", Payload: map[string]any{"api_token": "access", "refresh_token": "refresh"}}
			return credential, userID == credential.UserID, nil
		},
	}
	repositories := &storage.MockRepositories{Credential: record.LMSCredential{
		UserID: 17, LMSKey: "canvas", Payload: map[string]any{"api_token": "access", "refresh_token": "refresh"},
	}}
	service, err := lms.NewService(lms.Config{
		Store: store, AuthAttempts: repositories,
		ProviderFactories: map[string]provider.Factory{"canvas": func(configuration map[string]any, redirectURI string, credentials provider.CredentialRepository, attempts provider.AuthAttemptRepository) (provider.Provider, error) {
			return canvasprovider.New(configuration, redirectURI, credentials, attempts)
		}},
	})
	if err != nil {
		t.Fatalf("NewService returned error: %v", err)
	}

	if err := service.UpdateContentHTML(context.Background(), auth.Principal{AgentID: 17, TenantID: 7}, 99, expectedHTML); err != nil {
		t.Fatalf("UpdateContentHTML returned error: %v", err)
	}
	if updatedHTML != expectedHTML {
		t.Fatalf("Canvas received HTML %q, want %q", updatedHTML, expectedHTML)
	}
}

func TestGetContentHTMLRetrievesCurrentCanvasPage(t *testing.T) {
	const expectedHTML = `<main><h1>Current Canvas page</h1></main>`
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet || r.URL.Path != "/api/v1/courses/42/pages/page_id:7" || r.URL.Query().Get("include[]") != "body" {
			t.Errorf("unexpected Canvas request: %s %s?%s", r.Method, r.URL.Path, r.URL.RawQuery)
			http.NotFound(w, r)
			return
		}
		_, _ = w.Write([]byte(`{"page_id":7,"url":"welcome","body":"<main><h1>Current Canvas page</h1></main>"}`))
	}))
	defer server.Close()

	store := &storage.MockStore{
		ContentByIDFunc: func(_ context.Context, id int64) (record.Content, bool, error) {
			return record.Content{ID: id, CourseID: 12, ExternalID: "page:welcome", ExternalData: map[string]any{
				"content_id": 7, "content_type": "page", "updated_at": "2026-10-23T12:00:00Z",
			}}, true, nil
		},
		CourseByIDFunc: func(_ context.Context, id int64) (record.Course, bool, error) {
			return record.Course{ID: id, TenantID: 7, ExternalID: "course:42", ExternalData: map[string]any{"course_id": "42"}}, true, nil
		},
		ProviderConfigurationFunc: func(_ context.Context, tenantID int64) (record.ProviderConfiguration, bool, error) {
			return record.ProviderConfiguration{TenantID: tenantID, LMSKey: "canvas", Data: map[string]any{
				"base_url": server.URL, "client_id": "client", "client_secret": "secret",
			}}, true, nil
		},
		ActiveCredentialFunc: func(_ context.Context, userID int64) (record.LMSCredential, bool, error) {
			credential := record.LMSCredential{UserID: 17, LMSKey: "canvas", Payload: map[string]any{"api_token": "access", "refresh_token": "refresh"}}
			return credential, userID == credential.UserID, nil
		},
	}
	repositories := &storage.MockRepositories{Credential: record.LMSCredential{
		UserID: 17, LMSKey: "canvas", Payload: map[string]any{"api_token": "access", "refresh_token": "refresh"},
	}}
	service, err := lms.NewService(lms.Config{
		Store: store, AuthAttempts: repositories,
		ProviderFactories: map[string]provider.Factory{"canvas": func(configuration map[string]any, redirectURI string, credentials provider.CredentialRepository, attempts provider.AuthAttemptRepository) (provider.Provider, error) {
			return canvasprovider.New(configuration, redirectURI, credentials, attempts)
		}},
	})
	if err != nil {
		t.Fatalf("NewService returned error: %v", err)
	}

	got, err := service.GetContentHTML(context.Background(), auth.Principal{AgentID: 17, TenantID: 7}, 99)
	if err != nil {
		t.Fatalf("GetContentHTML returned error: %v", err)
	}
	if got != expectedHTML {
		t.Fatalf("GetContentHTML returned %q, want %q", got, expectedHTML)
	}
}
