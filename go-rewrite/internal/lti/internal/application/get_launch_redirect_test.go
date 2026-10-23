package application_test

import (
	"context"
	"net/url"
	"testing"
	"time"

	"rewritetest/internal/lti/internal/application"
	"rewritetest/internal/lti/internal/domain"
	"rewritetest/internal/lti/internal/infrastructure"
	"rewritetest/internal/shared/apperr"

	"github.com/stretchr/testify/require"
)

func TestGetLaunchRedirect_Success(t *testing.T) {
	registrationRepo := infrastructure.NewMapMockRegistrationRepository()
	sessionRepo := infrastructure.NewMapMockLTISessionRepository()

	require.NoError(t, registrationRepo.Create(context.Background(), *domain.NewRegistration(
		"https://issuer.example",
		"client-1",
		"https://issuer.example/login",
		"https://issuer.example/jwks",
		"https://issuer.example/service-auth",
		"https://issuer.example/service-login",
		5,
	)))

	uc := application.NewGetLaunchRedirectUseCase(registrationRepo, sessionRepo)
	redirectURL, err := uc.Execute(context.Background(), application.GetLaunchRedirectQuery{
		Issuer:         "https://issuer.example",
		ClientID:       "client-1",
		LoginHint:      "hint-123",
		TargetLinkURI:  "https://tool.example/launch-target",
		RedirectURI:    "https://tool.example/lti/launch",
		LTIMessageHint: "msg-456",
		LTISessionTTL:  5 * time.Minute,
	})

	require.NoError(t, err)

	parsed, err := url.Parse(redirectURL)
	require.NoError(t, err)
	params := parsed.Query()
	require.Equal(t, "client-1", params.Get("client_id"))
	require.Equal(t, "hint-123", params.Get("login_hint"))
	require.Equal(t, "msg-456", params.Get("lti_message_hint"))
	require.NotEmpty(t, params.Get("state"))
	require.NotEmpty(t, params.Get("nonce"))

	session, err := sessionRepo.GetByState(context.Background(), params.Get("state"))
	require.NoError(t, err)
	require.NotNil(t, session)
	require.Equal(t, "https://tool.example/launch-target", session.TargetLinkURI())
	require.Equal(t, int64(5), session.TenantID())
}

func TestGetLaunchRedirect_MissingRegistrationIsNotFound(t *testing.T) {
	registrationRepo := infrastructure.NewMapMockRegistrationRepository()
	sessionRepo := infrastructure.NewMapMockLTISessionRepository()

	uc := application.NewGetLaunchRedirectUseCase(registrationRepo, sessionRepo)
	_, err := uc.Execute(context.Background(), application.GetLaunchRedirectQuery{
		Issuer:        "https://issuer.example",
		ClientID:      "missing-client",
		TargetLinkURI: "https://tool.example/launch-target",
		RedirectURI:   "https://tool.example/lti/launch",
	})

	require.Error(t, err)
	require.True(t, apperr.IsCode(err, apperr.CodeNotFound))
}
