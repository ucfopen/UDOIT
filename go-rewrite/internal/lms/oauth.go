package lms

import (
	"context"

	"github.com/golang-jwt/jwt/v5"
	"rewritetest/internal/shared/apperr"
)

func (s *Service) ProcessOAuthRedirect(ctx context.Context, state string, claims jwt.MapClaims, code string) (string, error) {
	authAttempt, found, err := s.authAttempts.Get(ctx, state)
	if err != nil {
		return "", err
	}
	if !found {
		return "", apperr.New(apperr.CodeUnauthorized, "OAuth state not found or expired")
	}
	configuration, ok, err := s.store.ProviderConfiguration(ctx, authAttempt.TenantID)
	if err != nil {
		return "", err
	}
	if !ok {
		return "", notFound("LMS provider configuration not found")
	}
	providerAdapter, err := s.providerForKey(configuration.LMSKey, configuration.Data)
	if err != nil {
		return "", err
	}
	return providerAdapter.CompleteAuthentication(ctx, authAttempt, claims, code)
}
