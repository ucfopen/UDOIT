package lms

import (
	"fmt"

	"rewritetest/internal/lms/internal/provider"
	"rewritetest/internal/shared/apperr"
)

type Service struct {
	store             Store
	authAttempts      provider.AuthAttemptRepository
	providerFactories providerRegistry
	oauthRedirectURI  string
}

type Config struct {
	Store             Store
	AuthAttempts      provider.AuthAttemptRepository
	ProviderFactories map[string]provider.Factory
	OAuthRedirectURI  string
}

func NewService(config Config) (*Service, error) {
	if config.Store == nil || config.AuthAttempts == nil {
		return nil, apperr.Internal("LMS storage dependencies are required")
	}
	authAttempts := config.AuthAttempts
	if len(config.ProviderFactories) == 0 {
		return nil, apperr.Internal("No LMS providers are configured")
	}
	registry := make(providerRegistry, len(config.ProviderFactories))
	for key, factory := range config.ProviderFactories {
		if factory == nil {
			return nil, apperr.Internal("An LMS provider factory is nil")
		}
		registry[key] = factory
	}
	return &Service{store: config.Store, authAttempts: authAttempts, providerFactories: registry, oauthRedirectURI: config.OAuthRedirectURI}, nil
}

func (s *Service) unsupportedProvider(key string) error {
	return apperr.Internal(fmt.Sprintf("The LMS provider %q is not supported", key))
}
