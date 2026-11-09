package canvas

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"rewritetest/internal/lms/internal/record"
	"rewritetest/internal/lms/internal/storage"
)

func TestBeginAuthenticationPersistsAttempt(t *testing.T) {
	repositories := &storage.MockRepositories{}
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) { http.Error(w, "unauthorized", http.StatusUnauthorized) }))
	defer server.Close()
	p, err := New(map[string]any{"base_url": server.URL, "client_id": "client", "client_secret": "secret"}, "https://app.example/callback", repositories, repositories)
	if err != nil {
		t.Fatal(err)
	}
	p.(*Canvas).httpClient = server.Client()
	challenge, err := p.BeginAuthentication(context.Background(), 17, 9, "https://app.example/launch")
	if err != nil {
		t.Fatalf("BeginAuthentication returned error: %v", err)
	}
	if challenge.Kind != "redirect" || challenge.RedirectURL == "" {
		t.Fatalf("unexpected authentication challenge: %+v", challenge)
	}
	if repositories.Attempt.UserID != 17 || repositories.Attempt.TenantID != 9 || repositories.Attempt.State == "" || repositories.Attempt.TargetLinkURI != "https://app.example/launch" {
		t.Fatalf("unexpected persisted auth attempt: %+v", repositories.Attempt)
	}
}

func TestCompleteAuthenticationPersistsCredential(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/login/oauth2/token" || r.Method != http.MethodPost {
			t.Errorf("unexpected token request: %s %s", r.Method, r.URL.Path)
		}
		_ = json.NewEncoder(w).Encode(map[string]any{"access_token": "access", "refresh_token": "refresh", "expires_in": 3600})
	}))
	defer server.Close()
	repositories := &storage.MockRepositories{}
	p, err := New(map[string]any{"base_url": server.URL, "client_id": "client", "client_secret": "secret"}, "https://app.example/callback", repositories, repositories)
	if err != nil {
		t.Fatal(err)
	}
	p.(*Canvas).httpClient = server.Client()
	target, err := p.CompleteAuthentication(context.Background(), record.AuthAttempt{UserID: 17, TargetLinkURI: "https://app.example/launch"}, nil, "auth-code")
	if err != nil {
		t.Fatalf("CompleteAuthentication returned error: %v", err)
	}
	if target != "https://app.example/launch" || repositories.Credential.Payload["api_token"] != "access" || repositories.Credential.Payload["refresh_token"] != "refresh" || repositories.Credential.ExpiresAt == nil {
		t.Fatalf("unexpected completion result: target=%q credential=%+v", target, repositories.Credential)
	}
}

func TestAuthenticatedRequestRefreshesPersistsAndRetries(t *testing.T) {
	requests := 0
	refreshes := 0
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/api/v1/courses/42/pages":
			requests++
			if r.Header.Get("Authorization") == "Bearer old-access" {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}
			if r.Header.Get("Authorization") != "Bearer new-access" {
				t.Errorf("unexpected authorization header: %q", r.Header.Get("Authorization"))
			}
			_, _ = w.Write([]byte("[]"))
		case "/login/oauth2/token":
			refreshes++
			_ = json.NewEncoder(w).Encode(map[string]any{"access_token": "new-access", "refresh_token": "new-refresh", "expires_in": 1800})
		default:
			http.NotFound(w, r)
		}
	}))
	defer server.Close()
	repositories := &storage.MockRepositories{Credential: record.LMSCredential{UserID: 17, LMSKey: "canvas", Payload: map[string]any{"api_token": "old-access", "refresh_token": "old-refresh"}}}
	p, err := New(map[string]any{"base_url": server.URL, "client_id": "client", "client_secret": "secret"}, "", repositories, repositories)
	if err != nil {
		t.Fatal(err)
	}
	p.(*Canvas).httpClient = server.Client()
	resp, err := p.(*Canvas).doAuthenticatedRequest(context.Background(), 17, CanvasRequest{Path: "/api/v1/courses/42/pages", Method: http.MethodGet})
	if err != nil {
		t.Fatalf("authenticated request returned error: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK || requests != 2 || refreshes != 1 {
		t.Fatalf("expected successful retry after one refresh; status=%d requests=%d refreshes=%d", resp.StatusCode, requests, refreshes)
	}
	if repositories.Credential.Payload["api_token"] != "new-access" || repositories.Credential.Payload["refresh_token"] != "new-refresh" {
		t.Fatalf("refreshed credential was not persisted: %+v", repositories.Credential)
	}
}
