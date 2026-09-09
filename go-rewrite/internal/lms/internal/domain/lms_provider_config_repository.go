package domain

import "context"

type LMSProviderConfigRepository interface {
	GetByTenant(ctx context.Context, tenantID int64) (*LMSProviderConfig, error)
	UpsertByTenant(ctx context.Context, tenantID int64, lmsKey LMSType, data map[string]any) error
}
