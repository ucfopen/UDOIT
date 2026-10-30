package application

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"net/url"
	"time"

	"rewritetest/internal/lti/internal/domain"
	"rewritetest/internal/shared/apperr"
)

type GetLaunchRedirectUseCase struct {
	registrationRepository domain.RegistrationRepository
	ltiSessionRepository   domain.LTISessionRepository
}

type GetLaunchRedirectQuery struct {
	Issuer         string
	ClientID       string
	LoginHint      string
	TargetLinkURI  string
	RedirectURI    string
	LTIMessageHint string
	LTISessionTTL  time.Duration
}

type LaunchRedirectParams struct {
	ClientID       string `json:"client_id"`
	State          string `json:"state"`
	Nonce          string `json:"nonce"`
	RedirectURI    string `json:"redirect_uri"`
	Scope          string `json:"scope"`
	ResponseType   string `json:"response_type"`
	ResponseMode   string `json:"response_mode"`
	Prompt         string `json:"prompt"`
	LTIMessageHint string `json:"lti_message_hint"`
}

func NewGetLaunchRedirectUseCase(registrationRepository domain.RegistrationRepository, ltiSessionRepository domain.LTISessionRepository) *GetLaunchRedirectUseCase {
	return &GetLaunchRedirectUseCase{
		registrationRepository: registrationRepository,
		ltiSessionRepository:   ltiSessionRepository,
	}
}

// This use case generates the launch redirect URL for the LTI login initiation request.
//
// Redirect Parameters:
// From IMS Security Framework 1.0, Section 5.1.1.2
// https://www.imsglobal.org/spec/security/v1p0/#step-2-authentication-request
// - client_id: The client ID of the tool.
// - state: A unique state parameter to prevent CSRF attacks.
// - nonce: A unique nonce parameter to associate the client session with the ID token.
// - redirect_uri: The URI to which the response will be sent.
// - scope: The scope of the authentication request. Must be "openid".
// - response_type: The type of response expected. Must be "id_token".
// - response_mode: The mode of the response Must be "form_post".
// - prompt: The prompt parameter. Must be "none".
// - login_hint: The login hint provided by the platform.
//
// From LTI 1.3, Section 4.1.1
// https://www.imsglobal.org/spec/lti/v1p3#lti_message_hint-login-parameter
// - lti_message_hint: An optional LTI message hint.
func (u *GetLaunchRedirectUseCase) Execute(ctx context.Context, query GetLaunchRedirectQuery) (string, error) {
	ttl := query.LTISessionTTL
	if ttl <= 0 {
		ttl = 10 * time.Minute
	}

	registration, err := u.registrationRepository.GetByIssuerAndClientID(ctx, query.Issuer, query.ClientID)
	if err != nil {
		return "", err
	}
	if registration == nil {
		return "", apperr.New(apperr.CodeNotFound, "LTI registration not found for the given issuer and client ID")
	}

	baseURL, err := url.Parse(registration.LoginAuthEndpoint)
	if err != nil {
		return "", apperr.Internal("Invalid login/auth endpoint URL in registration")
	}

	state, err := generateState()
	if err != nil {
		return "", apperr.Internal("Failed to generate state parameter")
	}

	nonce, err := generateNonce()
	if err != nil {
		return "", apperr.Internal("Failed to generate nonce parameter")
	}

	params := baseURL.Query()
	params.Set("client_id", registration.ClientID)
	params.Set("state", state)
	params.Set("nonce", nonce)
	params.Set("redirect_uri", query.RedirectURI)
	params.Set("scope", "openid")
	params.Set("response_type", "id_token")
	params.Set("response_mode", "form_post")
	params.Set("prompt", "none")
	params.Set("login_hint", query.LoginHint)
	if query.LTIMessageHint != "" {
		params.Set("lti_message_hint", query.LTIMessageHint)
	}
	baseURL.RawQuery = params.Encode()

	ltiSession := domain.NewLTISession(state, nonce, query.Issuer, query.ClientID, query.TargetLinkURI, registration.TenantID, time.Now(), time.Now().Add(ttl))
	if err := u.ltiSessionRepository.Create(ctx, ltiSession); err != nil {
		return "", apperr.Internal("Failed to create LTI session", apperr.WithCause(err))
	}

	return baseURL.String(), nil
}

func generateState() (string, error) {
	token := make([]byte, 16)
	_, err := rand.Read(token)
	if err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(token), nil
}

func generateNonce() (string, error) {
	token := make([]byte, 16)
	_, err := rand.Read(token)
	if err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(token), nil
}
