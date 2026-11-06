package canvas

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"rewritetest/internal/lms/internal/record"
)

type authTestRepositories struct {
	credential record.LMSCredential
	attempt    record.AuthAttempt
	status     int
}

func (r *authTestRepositories) ActiveCredential(context.Context, int64) (record.LMSCredential, bool, error) {
	return r.credential, r.credential.UserID != 0, nil
}
func (r *authTestRepositories) SaveCredential(_ context.Context, value record.LMSCredential) error {
	r.credential = value
	return nil
}
func (r *authTestRepositories) Save(_ context.Context, value record.AuthAttempt) error {
	r.attempt = value
	return nil
}
func (r *authTestRepositories) Get(context.Context, string) (record.AuthAttempt, bool, error) {
	return r.attempt, r.attempt.State != "", nil
}

func TestBeginAuthenticationPersistsAttempt(t *testing.T) {
	repositories := &authTestRepositories{}
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
	if repositories.attempt.UserID != 17 || repositories.attempt.TenantID != 9 || repositories.attempt.State == "" || repositories.attempt.TargetLinkURI != "https://app.example/launch" {
		t.Fatalf("unexpected persisted auth attempt: %+v", repositories.attempt)
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
	repositories := &authTestRepositories{}
	p, err := New(map[string]any{"base_url": server.URL, "client_id": "client", "client_secret": "secret"}, "https://app.example/callback", repositories, repositories)
	if err != nil {
		t.Fatal(err)
	}
	p.(*Canvas).httpClient = server.Client()
	target, err := p.CompleteAuthentication(context.Background(), record.AuthAttempt{UserID: 17, TargetLinkURI: "https://app.example/launch"}, nil, "auth-code")
	if err != nil {
		t.Fatalf("CompleteAuthentication returned error: %v", err)
	}
	if target != "https://app.example/launch" || repositories.credential.Payload["api_token"] != "access" || repositories.credential.Payload["refresh_token"] != "refresh" || repositories.credential.ExpiresAt == nil {
		t.Fatalf("unexpected completion result: target=%q credential=%+v", target, repositories.credential)
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
	repositories := &authTestRepositories{credential: record.LMSCredential{UserID: 17, LMSKey: "canvas", Payload: map[string]any{"api_token": "old-access", "refresh_token": "old-refresh"}}}
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
	if repositories.credential.Payload["api_token"] != "new-access" || repositories.credential.Payload["refresh_token"] != "new-refresh" {
		t.Fatalf("refreshed credential was not persisted: %+v", repositories.credential)
	}
}
