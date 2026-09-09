package domain

import "context"

type LMSProviderResolver interface {
	GetByTenant(ctx context.Context, tenantID int64) (FullLMSProvider, error)
}
