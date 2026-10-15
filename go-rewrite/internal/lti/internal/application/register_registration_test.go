package application_test

import (
	"context"
	"testing"

	"rewritetest/internal/lti/internal/application"
	"rewritetest/internal/lti/internal/domain"
	"rewritetest/internal/lti/internal/infrastructure"
	"rewritetest/internal/shared/apperr"

	"github.com/stretchr/testify/require"
)

func TestRegisterRegistration_CreatesWhenMissing(t *testing.T) {
	repo := infrastructure.NewMapMockRegistrationRepository()
	createCalls := 0

	originalCreate := repo.CreateFunc
	repo.CreateFunc = func(ctx context.Context, registration domain.Registration) error {
		createCalls++
		return originalCreate(ctx, registration)
	}

	uc := application.NewRegisterRegistrationUseCase(repo)
	err := uc.Execute(context.Background(), application.RegisterRegistrationCommand{
		Issuer:               "https://issuer.example",
		ClientID:             "client-1",
		TenantID:             3,
		LoginAuthEndpoint:    "https://issuer.example/login",
		JWKEndpoint:          "https://issuer.example/jwks",
		ServiceAuthEndpoint:  "https://issuer.example/service-auth",
		ServiceLoginEndpoint: "https://issuer.example/service-login",
	})

	require.NoError(t, err)
	require.Equal(t, 1, createCalls)

	registration, err := repo.GetByIssuerAndClientID(context.Background(), "https://issuer.example", "client-1")
	require.NoError(t, err)
	require.NotNil(t, registration)
	require.Equal(t, int64(3), registration.TenantID)
}

func TestRegisterRegistration_SavesWhenExisting(t *testing.T) {
	repo := infrastructure.NewMapMockRegistrationRepository()
	seed := domain.NewRegistration(
		"https://issuer.example",
		"client-1",
		"https://issuer.example/login-old",
		"https://issuer.example/jwks-old",
		"https://issuer.example/service-auth-old",
		"https://issuer.example/service-login-old",
		3,
	)
	require.NoError(t, repo.Create(context.Background(), *seed))

	createCalls := 0
	saveCalls := 0
	originalCreate := repo.CreateFunc
	originalSave := repo.SaveFunc
	repo.CreateFunc = func(ctx context.Context, registration domain.Registration) error {
		createCalls++
		return originalCreate(ctx, registration)
	}
	repo.SaveFunc = func(ctx context.Context, registration domain.Registration) error {
		saveCalls++
		return originalSave(ctx, registration)
	}

	uc := application.NewRegisterRegistrationUseCase(repo)
	err := uc.Execute(context.Background(), application.RegisterRegistrationCommand{
		Issuer:               "https://issuer.example",
		ClientID:             "client-1",
		TenantID:             3,
		LoginAuthEndpoint:    "https://issuer.example/login-new",
		JWKEndpoint:          "https://issuer.example/jwks-new",
		ServiceAuthEndpoint:  "https://issuer.example/service-auth-new",
		ServiceLoginEndpoint: "https://issuer.example/service-login-new",
	})

	require.NoError(t, err)
	require.Equal(t, 0, createCalls)
	require.Equal(t, 1, saveCalls)

	registration, err := repo.GetByIssuerAndClientID(context.Background(), "https://issuer.example", "client-1")
	require.NoError(t, err)
	require.NotNil(t, registration)
	require.Equal(t, "https://issuer.example/login-new", registration.LoginAuthEndpoint)
}

func TestRegisterRegistration_ValidationError(t *testing.T) {
	repo := infrastructure.NewMapMockRegistrationRepository()
	uc := application.NewRegisterRegistrationUseCase(repo)

	err := uc.Execute(context.Background(), application.RegisterRegistrationCommand{ClientID: "client-1", TenantID: 3})

	require.Error(t, err)
	require.True(t, apperr.IsCode(err, apperr.CodeValidation))
}
