package canvas

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"rewritetest/internal/lms/internal/domain"
	"rewritetest/internal/shared/apperr"
)

type canvasCredential struct {
	apiToken     string
	refreshToken string
	expiresAt    *time.Time
}

func (p *CanvasLMSProvider) BeginAuthentication(ctx context.Context, userID int64, targetLinkURI string) (domain.AuthChallenge, error) {
	baseURL, err := url.Parse(p.config.baseURL)
	if err != nil {
		return domain.AuthChallenge{}, apperr.New(
			apperr.CodeInternal, "Invalid Canvas base URL",
			apperr.WithCause(err),
		)
	}

	isAuthenticated, err := p.checkIsAuthenticated(ctx, p.config, userID)
	if err != nil {
		return domain.AuthChallenge{}, err
	}
	if isAuthenticated {
		return domain.AuthChallenge{
			Kind: domain.AuthChallengeKindNone,
		}, nil
	}

	state, err := generateState()
	if err != nil {
		return domain.AuthChallenge{}, apperr.Internal("Failed to generate state", apperr.WithCause(err))
	}

	params := baseURL.Query()
	params.Set("client_id", p.config.clientID)
	params.Set("response_type", "code")
	params.Set("redirect_uri", p.oauthRedirectURI)
	params.Set("state", state)
	baseURL.Path = "/login/oauth2/auth"
	baseURL.RawQuery = params.Encode()

	authAttempt := domain.AuthAttempt{
		UserID:        userID,
		TenantID:      p.config.tenantID,
		State:         state,
		TargetLinkURI: targetLinkURI,
		CreatedAt:     time.Now(),
		ExpiresAt:     time.Now().Add(time.Hour), // TODO: Make expiration time configurable
	}
	err = p.authAttemptRepository.Create(ctx, authAttempt)
	if err != nil {
		return domain.AuthChallenge{}, err
	}

	return domain.AuthChallenge{
		Kind:        domain.AuthChallengeKindRedirect,
		RedirectURL: baseURL.String(),
	}, nil
}

type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int    `json:"expires_in"`
	TokenType    string `json:"token_type"`
}

func (p *CanvasLMSProvider) ProcessOAuthRedirect(ctx context.Context, authAttempt domain.AuthAttempt, code string) (string, error) {
	baseURL, err := url.Parse(p.config.baseURL)
	if err != nil {
		return "", apperr.Validation("Invalid Canvas base URL", apperr.WithCause(err))
	}

	baseURL.Path = "/login/oauth2/token"

	formData := url.Values{}
	formData.Set("grant_type", "authorization_code")
	formData.Set("client_id", p.config.clientID)
	formData.Set("client_secret", p.config.clientSecret)
	formData.Set("redirect_uri", p.oauthRedirectURI)
	formData.Set("code", code)

	payload := strings.NewReader(formData.Encode())
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, baseURL.String(), payload)
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

	var oauthResponse TokenResponse
	err = json.NewDecoder(resp.Body).Decode(&oauthResponse)
	if err != nil {
		return "", apperr.Validation("Failed to decode OAuth token JSON response", apperr.WithCause(err))
	}

	expiresAt := time.Now().Add(time.Duration(oauthResponse.ExpiresIn) * time.Second)

	// TODO: move map creation somewhere that gives type safety when Canvas credential schema changes
	lmsCredential := domain.NewLMSCredential(
		authAttempt.UserID,
		domain.LMSTypeCanvas,
		map[string]any{
			"api_token":     oauthResponse.AccessToken,
			"refresh_token": oauthResponse.RefreshToken,
		},
		&expiresAt,
		time.Now(),
	)

	err = p.lmsCredentialRepository.UpsertActive(ctx, lmsCredential)
	if err != nil {
		return "", err
	}

	return authAttempt.TargetLinkURI, nil
}

func generateState() (string, error) {
	token := make([]byte, 16)
	_, err := rand.Read(token)
	if err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(token), nil
}

type RefreshTokenRequest struct {
	ClientID     string `json:"client_id"`
	ClientSecret string `json:"client_secret"`
	RefreshToken string `json:"refresh_token"`
	GrantType    string `json:"grant_type"`
}

func (p *CanvasLMSProvider) asCanvasCredential(cred domain.LMSCredential) (canvasCredential, error) {
	if cred.LMSKey() != "canvas" {
		return canvasCredential{}, apperr.Internal("Missing or invalid LMS type in credential data")
	}

	apiToken, ok := cred.Payload()["api_token"].(string)
	if !ok {
		return canvasCredential{}, apperr.Internal("Missing or invalid API token in credential data")
	}

	refreshToken, ok := cred.Payload()["refresh_token"].(string)
	if !ok {
		return canvasCredential{}, apperr.Internal("Missing or invalid refresh token in credential data")
	}

	return canvasCredential{
		apiToken:     apiToken,
		refreshToken: refreshToken,
		expiresAt:    cred.ExpiresAt(),
	}, nil
}

// Obtains a refreshed access token from Canvas.
// Does not persist the credential
// https://developerdocs.instructure.com/services/canvas/oauth2/file.oauth_endpoints#post-login-oauth2-token
func (p *CanvasLMSProvider) refreshAccessToken(ctx context.Context, cred canvasCredential, config canvasConfig) (canvasCredential, error) {
	refreshURL := fmt.Sprintf("%s/login/oauth2/token", config.baseURL)

	requestBody := RefreshTokenRequest{
		ClientID:     config.clientID,
		ClientSecret: config.clientSecret,
		RefreshToken: cred.refreshToken,
		GrantType:    "refresh_token",
	}

	requestBodyBytes, err := json.Marshal(requestBody)
	if err != nil {
		return canvasCredential{}, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, refreshURL, bytes.NewReader(requestBodyBytes))
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

	var tokenResponse TokenResponse
	err = json.NewDecoder(resp.Body).Decode(&tokenResponse)
	if err != nil {
		return canvasCredential{}, err
	}

	cred.apiToken = tokenResponse.AccessToken
	if tokenResponse.RefreshToken != "" {
		cred.refreshToken = tokenResponse.RefreshToken
	}
	expiresAt := time.Now().Add(time.Duration(tokenResponse.ExpiresIn) * time.Second)
	cred.expiresAt = &expiresAt

	return cred, nil
}

type CanvasRequest struct {
	Path   string
	URL    string
	Body   any
	Method string
	Config canvasConfig
	UserID int64
}

// Performs an authenticated HTTP request to the Canvas API, automatically
// handling token refresh if the access token has expired.
func (p *CanvasLMSProvider) doAuthenticatedRequest(ctx context.Context, req CanvasRequest) (*http.Response, error) {
	var bodyReader io.Reader
	if req.Body != nil {
		bodyBytes, err := json.Marshal(req.Body)
		if err != nil {
			return nil, err
		}
		bodyReader = bytes.NewReader(bodyBytes)
	}

	url := req.URL
	if url == "" {
		url = req.Config.baseURL + req.Path
	}

	httpReq, err := http.NewRequestWithContext(ctx, req.Method, url, bodyReader)
	if err != nil {
		return nil, apperr.Internal("Failed to create HTTP request")
	}

	httpReq.Header.Set("Accept", "application/json")

	cred, err := p.lmsCredentialRepository.GetActiveByUser(ctx, req.UserID)
	if err != nil {
		return nil, err
	}
	if cred == nil {
		return nil, apperr.New(apperr.CodeUnauthorized, "Canvas LMS credential not found")
	}

	credential, err := p.asCanvasCredential(*cred)
	if err != nil {
		return nil, err
	}

	maxAttempts := 2

	for attempt := 1; attempt <= maxAttempts; attempt++ {
		resp, err := p.executeRequest(ctx, httpReq, credential.apiToken)
		if err != nil {
			return nil, err
		}

		if resp.StatusCode != http.StatusUnauthorized {
			return resp, nil
		}

		resp.Body.Close()

		if attempt == maxAttempts {
			return resp, nil
		}

		// Attempt to refresh the access token since the previous request was unauthorized

		credential, err := p.refreshAccessToken(ctx, credential, req.Config)
		if err != nil {
			return nil, err
		}

		lmsCredential := domain.NewLMSCredential(
			req.UserID,
			domain.LMSTypeCanvas,
			map[string]any{
				"api_token":     credential.apiToken,
				"refresh_token": credential.refreshToken,
			},
			credential.expiresAt,
			time.Now(),
		)

		if err := p.lmsCredentialRepository.UpsertActive(ctx, lmsCredential); err != nil {
			return nil, err
		}

	}

	panic("unreachable")
}

func (p *CanvasLMSProvider) executeRequest(ctx context.Context, req *http.Request, token string) (*http.Response, error) {
	r := req.Clone(ctx)

	if req.GetBody != nil {
		body, err := req.GetBody()
		if err != nil {
			return nil, err
		}
		r.Body = body
	}

	r.Header.Set("Authorization", "Bearer "+token)

	return p.httpClient.Do(r)
}

// Should return false if the user is not authenticated.
// Should only error if there is an unexpected issue, not simply because the user is not authenticated.
func (p *CanvasLMSProvider) checkIsAuthenticated(ctx context.Context, config canvasConfig, userID int64) (bool, error) {
	res, err := p.doAuthenticatedRequest(ctx, CanvasRequest{
		Path:   "/api/v1/users/self",
		Body:   nil,
		Method: http.MethodGet,
		Config: config,
		UserID: userID,
	})
	if err != nil {
		return false, nil
	}

	if res.StatusCode == http.StatusOK {
		return true, nil
	}

	return false, nil
}
