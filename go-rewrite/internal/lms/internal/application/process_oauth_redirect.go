package application

import (
	"context"

	"rewritetest/internal/lms/internal/domain"
	"rewritetest/internal/shared/apperr"
)

type ProcessOAuthRedirectUseCase struct {
	lmsProviderResolver         domain.LMSProviderResolver
	lmsProviderConfigRepository domain.LMSProviderConfigRepository
	authAttemptRepository       domain.AuthAttemptRepository
}

func NewProcessOAuthRedirectUseCase(
	lmsProviderResolver domain.LMSProviderResolver,
	lmsProviderConfigRepository domain.LMSProviderConfigRepository,
	authAttemptRepository domain.AuthAttemptRepository,
) *ProcessOAuthRedirectUseCase {
	return &ProcessOAuthRedirectUseCase{
		lmsProviderResolver:         lmsProviderResolver,
		lmsProviderConfigRepository: lmsProviderConfigRepository,
		authAttemptRepository:       authAttemptRepository,
	}
}

type ProcessOAuthRedirectResponse struct {
	RedirectURL string
}

func (u *ProcessOAuthRedirectUseCase) Execute(ctx context.Context, state string, code string) (string, error) {
	authAttempt, err := u.authAttemptRepository.GetByState(ctx, state)
	if err != nil {
		return "", apperr.New(
			apperr.CodeInternal, "Failed to find auth attempt by state",
			apperr.WithCause(err),
		)
	}

	provider, err := u.lmsProviderResolver.GetByTenant(ctx, authAttempt.TenantID)
	if err != nil {
		return "", apperr.New(
			apperr.CodeInternal, "Failed to find provider by tenant ID",
			apperr.WithCause(err),
		)
	}

	oauthRedirectProcessor, ok := provider.(domain.OAuthRedirectProcessor)
	if !ok {
		return "", apperr.New(
			apperr.CodeInternal, "The provider does not support OAuth",
		)
	}

	redirectURL, err := oauthRedirectProcessor.ProcessOAuthRedirect(ctx, authAttempt, code)
	if err != nil {
		return "", err
	}

	return redirectURL, nil
}
