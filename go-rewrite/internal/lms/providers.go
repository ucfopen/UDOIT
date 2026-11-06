package lms

import (
	"context"

	"github.com/golang-jwt/jwt/v5"

	"rewritetest/internal/lms/internal/provider"
)

type providerRegistry map[string]provider.Factory

func (s *Service) providerForTenant(ctx context.Context, tenantID int64) (provider.Provider, error) {
	configuration, ok, err := s.store.ProviderConfiguration(ctx, tenantID)
	if err != nil {
		return nil, err
	}
	if !ok {
		return nil, notFound("LMS provider configuration not found")
	}
	return s.providerForKey(configuration.LMSKey, configuration.Data)
}

func (s *Service) providerForKey(key string, data map[string]any) (provider.Provider, error) {
	factory, ok := s.providerFactories[key]
	if !ok {
		return nil, s.unsupportedProvider(key)
	}
	return factory(data, s.oauthRedirectURI, s.store, s.authAttempts)
}

func validProviderKey(key string) bool {
	_, ok := supportedProviderKeys[key]
	return ok
}

var supportedProviderKeys = map[string]struct{}{"canvas": {}}

func (s *Service) BeginAuthentication(ctx context.Context, userID, tenantID int64, targetLinkURI string) (AuthChallenge, error) {
	providerAdapter, err := s.providerForTenant(ctx, tenantID)
	if err != nil {
		return AuthChallenge{}, err
	}
	challenge, err := providerAdapter.BeginAuthentication(ctx, userID, tenantID, targetLinkURI)
	if err != nil {
		return AuthChallenge{}, err
	}
	return AuthChallenge{Kind: AuthChallengeKind(challenge.Kind), RedirectURL: challenge.RedirectURL}, nil
}

func (s *Service) GetCourseInfoFromLTILaunch(ctx context.Context, tenantID int64, claims jwt.MapClaims) (string, map[string]any, error) {
	p, err := s.providerForTenant(ctx, tenantID)
	if err != nil {
		return "", nil, err
	}
	course, err := p.CourseFromLaunch(claims)
	if err != nil {
		return "", nil, err
	}
	return course.ExternalID, course.ExternalData, nil
}
