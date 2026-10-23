package lms

import (
	"context"

	"rewritetest/internal/lms/internal/domain"
	"rewritetest/internal/lms/internal/infrastructure/providers/canvas"
	"rewritetest/internal/shared/apperr"
)

func (m *Module) IsValidLMSType(lmsKey string) bool {
	lmsType := domain.LMSType(lmsKey)
	return lmsType.IsValid()
}

func (m *Module) SaveProviderConfig(ctx context.Context, tenantID int64, lmsKey string, configData map[string]any) error {
	return m.providerConfigRepository.UpsertByTenant(ctx, tenantID, domain.LMSType(lmsKey), configData)
}

func (m *Module) ValidateProviderConfig(ctx context.Context, lmsKey string, configData map[string]any) error {
	lmsType, err := domain.ParseLMSType(lmsKey)
	if err != nil {
		return err
	}

	// This is a second switch statement (the first one found in the provider
	// resolver). Abstracting it into some registry could be valuable in the
	// future.
	switch lmsType {
	case domain.LMSTypeCanvas:
		return canvas.ValidateConfig(configData)
	default:
		return apperr.Internal("The provided LMS type is not supported")
	}
}
