package infrastructure

import (
	"context"

	"rewritetest/internal/lms/internal/domain"
	"rewritetest/internal/lms/internal/infrastructure/providers/canvas"
	"rewritetest/internal/shared/apperr"
)

type TenantLMSProviderResolver struct {
	configRepository        domain.LMSProviderConfigRepository
	lmsCredentialRepository domain.LMSCredentialRepository
	authAttemptRepository   domain.AuthAttemptRepository
	oAuthRedirectURI        string
}

func NewTenantLMSProviderResolver(
	configRepository domain.LMSProviderConfigRepository,
	lmsCredentialRepository domain.LMSCredentialRepository,
	authAttemptRepository domain.AuthAttemptRepository,
	oAuthRedirectURI string,
) *TenantLMSProviderResolver {
	return &TenantLMSProviderResolver{
		configRepository:        configRepository,
		lmsCredentialRepository: lmsCredentialRepository,
		authAttemptRepository:   authAttemptRepository,
		oAuthRedirectURI:        oAuthRedirectURI,
	}
}

func (r *TenantLMSProviderResolver) GetByTenant(ctx context.Context, tenantID int64) (domain.FullLMSProvider, error) {
	var zero domain.FullLMSProvider

	config, err := r.configRepository.GetByTenant(ctx, tenantID)
	if err != nil {
		return zero, err
	}

	switch config.LMSKey() {
	case domain.LMSTypeCanvas:
		return canvas.NewCanvasLMSProvider(r.lmsCredentialRepository, r.authAttemptRepository, r.oAuthRedirectURI, *config)
	}

	return zero, apperr.Internal("An invalid provider key was supplied.")
}

var _ domain.LMSProviderResolver = (*TenantLMSProviderResolver)(nil)
