package canvas

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	urlpkg "net/url"
	"strings"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"rewritetest/internal/lms/internal/provider"
	"rewritetest/internal/lms/internal/record"
	"rewritetest/internal/shared/apperr"
)

type canvasCredential struct {
	apiToken     string
	refreshToken string
	expiresAt    *time.Time
}

var credentialRefreshLocks = struct {
	sync.Mutex
	byUser map[int64]*sync.Mutex
}{byUser: make(map[int64]*sync.Mutex)}

func (p *Canvas) BeginAuthentication(ctx context.Context, userID, tenantID int64, targetLinkURI string) (provider.AuthChallenge, error) {
	cfg := p.config
	authenticated, err := p.checkIsAuthenticated(ctx, userID)
	if err != nil {
		return provider.AuthChallenge{}, err
	}
	if authenticated {
		return provider.AuthChallenge{Kind: "none"}, nil
	}
	if p.authAttempts == nil {
		return provider.AuthChallenge{}, apperr.Internal("Canvas auth-attempt repository is not configured")
	}
	baseURL, err := urlpkg.Parse(cfg.baseURL)
	if err != nil {
		return provider.AuthChallenge{}, apperr.New(apperr.CodeInternal, "Invalid Canvas base URL", apperr.WithCause(err))
	}
	state, err := generateState()
	if err != nil {
		return provider.AuthChallenge{}, apperr.Internal("Failed to generate state", apperr.WithCause(err))
	}
	params := baseURL.Query()
	params.Set("client_id", cfg.clientID)
	params.Set("response_type", "code")
	params.Set("redirect_uri", p.redirectURI)
	params.Set("state", state)
	baseURL.Path = "/login/oauth2/auth"
	baseURL.RawQuery = params.Encode()
	now := time.Now()
	attempt := record.AuthAttempt{UserID: userID, TenantID: tenantID, State: state, TargetLinkURI: targetLinkURI, CreatedAt: now, ExpiresAt: now.Add(time.Hour)}
	if err := p.authAttempts.Save(ctx, attempt); err != nil {
		return provider.AuthChallenge{}, err
	}
	return provider.AuthChallenge{Kind: "redirect", RedirectURL: baseURL.String()}, nil
}

type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int    `json:"expires_in"`
	TokenType    string `json:"token_type"`
}

func (p *Canvas) CompleteAuthentication(ctx context.Context, attempt record.AuthAttempt, _ jwt.MapClaims, code string) (string, error) {
	cfg := p.config
	endpoint, err := urlpkg.Parse(cfg.baseURL)
	if err != nil {
		return "", apperr.Validation("Invalid Canvas base URL", apperr.WithCause(err))
	}
	endpoint.Path = "/login/oauth2/token"
	form := urlpkg.Values{}
	form.Set("grant_type", "authorization_code")
	form.Set("client_id", cfg.clientID)
	form.Set("client_secret", cfg.clientSecret)
	form.Set("redirect_uri", p.redirectURI)
	form.Set("code", code)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint.String(), strings.NewReader(form.Encode()))
	if err != nil {
		return "", apperr.Internal("Failed to create HTTP request", apperr.WithCause(err))
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	resp, err := p.httpClient.Do(req)
	if err != nil {
		return "", apperr.Internal("Failed to send HTTP request", apperr.WithCause(err))
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return "", apperr.Internal(fmt.Sprintf("Unexpected status code: %d", resp.StatusCode))
	}
	var token TokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&token); err != nil {
		return "", apperr.Validation("Failed to decode OAuth token JSON response", apperr.WithCause(err))
	}
	if token.AccessToken == "" || token.RefreshToken == "" {
		return "", apperr.Validation("Canvas OAuth token response is missing credentials")
	}
	expiresAt := time.Now().Add(time.Duration(token.ExpiresIn) * time.Second)
	credential := record.LMSCredential{UserID: attempt.UserID, LMSKey: p.Type(), Payload: map[string]any{"api_token": token.AccessToken, "refresh_token": token.RefreshToken}, ExpiresAt: &expiresAt, Active: true}
	if p.credentials == nil {
		return "", apperr.Internal("Canvas credential repository is not configured")
	}
	if err := p.credentials.SaveCredential(ctx, credential); err != nil {
		return "", err
	}
	return attempt.TargetLinkURI, nil
}

func generateState() (string, error) {
	token := make([]byte, 16)
	if _, err := rand.Read(token); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(token), nil
}

func asCanvasCredential(payload map[string]any) (canvasCredential, error) {
	apiToken, ok := payload["api_token"].(string)
	if !ok || apiToken == "" {
		return canvasCredential{}, apperr.Internal("Missing or invalid API token in credential data")
	}
	refreshToken, ok := payload["refresh_token"].(string)
	if !ok || refreshToken == "" {
		return canvasCredential{}, apperr.Internal("Missing or invalid refresh token in credential data")
	}
	return canvasCredential{apiToken: apiToken, refreshToken: refreshToken}, nil
}

func (p *Canvas) refreshAccessToken(ctx context.Context, cred canvasCredential, config canvasConfig) (canvasCredential, error) {
	refreshURL := fmt.Sprintf("%s/login/oauth2/token", config.baseURL)
	requestBody := map[string]string{"client_id": config.clientID, "client_secret": config.clientSecret, "refresh_token": cred.refreshToken, "grant_type": "refresh_token"}
	body, err := json.Marshal(requestBody)
	if err != nil {
		return canvasCredential{}, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, refreshURL, bytes.NewReader(body))
	if err != nil {
		return canvasCredential{}, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := p.httpClient.Do(req)
	if err != nil {
		return canvasCredential{}, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return canvasCredential{}, apperr.Internal(fmt.Sprintf("Unexpected status code: %d", resp.StatusCode))
	}
	var token TokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&token); err != nil {
		return canvasCredential{}, err
	}
	if token.AccessToken == "" {
		return canvasCredential{}, apperr.Internal("Canvas token refresh response is missing an access token")
	}
	cred.apiToken = token.AccessToken
	if token.RefreshToken != "" {
		cred.refreshToken = token.RefreshToken
	}
	expiresAt := time.Now().Add(time.Duration(token.ExpiresIn) * time.Second)
	cred.expiresAt = &expiresAt
	return cred, nil
}

type CanvasRequest struct {
	Path   string
	URL    string
	Query  urlpkg.Values
	Body   any
	Method string
}

func (p *Canvas) doAuthenticatedRequest(ctx context.Context, userID int64, req CanvasRequest) (*http.Response, error) {
	cfg := p.config
	var err error
	var body []byte
	if req.Body != nil {
		body, err = json.Marshal(req.Body)
		if err != nil {
			return nil, err
		}
	}
	requestURL := req.URL
	if requestURL == "" {
		requestURL = cfg.baseURL + req.Path
	}
	if len(req.Query) > 0 {
		parsed, parseErr := urlpkg.Parse(requestURL)
		if parseErr != nil {
			return nil, apperr.Internal("Failed to parse request URL", apperr.WithCause(parseErr))
		}
		query := parsed.Query()
		for key, values := range req.Query {
			for _, value := range values {
				query.Add(key, value)
			}
		}
		parsed.RawQuery = query.Encode()
		requestURL = parsed.String()
	}
	return p.doAuthenticatedHTTP(ctx, userID, req.Method, requestURL, map[string][]string{"Accept": {"application/json"}}, body)
}

func (p *Canvas) doAuthenticatedHTTP(ctx context.Context, userID int64, method, requestURL string, headers map[string][]string, body []byte) (*http.Response, error) {
	if p.credentials == nil {
		return nil, apperr.Internal("Canvas credential repository is not configured")
	}
	lock := refreshLockForUser(userID)
	lock.Lock()
	defer lock.Unlock()
	credential, found, err := p.credentials.ActiveCredential(ctx, userID)
	if err != nil {
		return nil, err
	}
	if !found {
		return nil, apperr.New(apperr.CodeUnauthorized, "Canvas LMS credential not found")
	}
	canvasCredential, err := asCanvasCredential(credential.Payload)
	if err != nil {
		return nil, err
	}
	response, err := p.executeAuthenticatedHTTP(ctx, method, requestURL, headers, body, credential.Payload)
	if err != nil || response.StatusCode != http.StatusUnauthorized {
		return response, err
	}
	response.Body.Close()

	refreshed, err := p.refreshAccessToken(ctx, canvasCredential, p.config)
	if err != nil {
		return nil, err
	}
	credential.Payload = map[string]any{"api_token": refreshed.apiToken, "refresh_token": refreshed.refreshToken}
	credential.ExpiresAt = refreshed.expiresAt
	if err := p.credentials.SaveCredential(ctx, credential); err != nil {
		return nil, err
	}
	return p.executeAuthenticatedHTTP(ctx, method, requestURL, headers, body, credential.Payload)
}

func refreshLockForUser(userID int64) *sync.Mutex {
	credentialRefreshLocks.Lock()
	defer credentialRefreshLocks.Unlock()
	lock := credentialRefreshLocks.byUser[userID]
	if lock == nil {
		lock = &sync.Mutex{}
		credentialRefreshLocks.byUser[userID] = lock
	}
	return lock
}

func (p *Canvas) executeAuthenticatedHTTP(ctx context.Context, method, requestURL string, headers map[string][]string, body []byte, payload map[string]any) (*http.Response, error) {
	request, err := http.NewRequestWithContext(ctx, method, requestURL, bytes.NewReader(body))
	if err != nil {
		return nil, apperr.Internal("Failed to create HTTP request", apperr.WithCause(err))
	}
	for key, values := range headers {
		request.Header[key] = append([]string(nil), values...)
	}
	request.Header.Set("Authorization", "Bearer "+stringValue(payload["api_token"]))
	return p.httpClient.Do(request)
}

func stringValue(value any) string {
	text, _ := value.(string)
	return text
}

func (p *Canvas) checkIsAuthenticated(ctx context.Context, userID int64) (bool, error) {
	res, err := p.doAuthenticatedRequest(ctx, userID, CanvasRequest{Path: "/api/v1/users/self", Method: http.MethodGet})
	if err != nil {
		return false, nil
	}
	defer res.Body.Close()
	return res.StatusCode == http.StatusOK, nil
}
