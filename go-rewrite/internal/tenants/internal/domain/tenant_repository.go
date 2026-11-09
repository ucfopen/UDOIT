package domain

import "context"

type TenantRepository interface {
	Create(ctx context.Context, lmsKey string) (*Tenant, error)
	GetByID(ctx context.Context, tenantID int64) (*Tenant, error)
}
