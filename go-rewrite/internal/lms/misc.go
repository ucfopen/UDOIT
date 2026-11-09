package lms

import (
	"context"

	"rewritetest/internal/lms/internal/provider/canvas"
	"rewritetest/internal/lms/internal/record"
	"rewritetest/internal/shared/apperr"
)

func (m *Service) IsValidLMSType(lmsKey string) bool {
	return validProviderKey(lmsKey)
}

func (m *Service) SaveProviderConfig(ctx context.Context, tenantID int64, lmsKey string, configData map[string]any) error {
	if err := m.ValidateProviderConfig(ctx, lmsKey, configData); err != nil {
		return err
	}
	return m.store.SaveProviderConfiguration(ctx, record.ProviderConfiguration{TenantID: tenantID, LMSKey: lmsKey, Data: configData})
}

func (m *Service) ValidateProviderConfig(ctx context.Context, lmsKey string, configData map[string]any) error {
	if !validProviderKey(lmsKey) {
		return apperr.Internal("The provided LMS type is not supported")
	}
	return canvas.ValidateConfig(configData)
}
