package tenants

import (
	"context"

	"rewritetest/internal/shared/apperr"
	"rewritetest/internal/tenants/internal/application"
)

type Tenant struct {
	ID     int64
	LMSKey string
}

func (m *Module) RegisterTenant(ctx context.Context, lmsKey string) (int64, error) {
	tenant, err := m.registerTenantUseCase.Execute(ctx, application.RegisterTenantCommand{LMSKey: lmsKey})
	if err != nil {
		return 0, err
	}
	if tenant == nil {
		return 0, apperr.Internal("Tenant repository returned no persisted tenant")
	}
	return tenant.ID(), nil
}

func (m *Module) GetTenant(ctx context.Context, tenantID int64) (Tenant, error) {
	tenant, err := m.tenantRepository.GetByID(ctx, tenantID)
	if err != nil {
		return Tenant{}, err
	}
	if tenant == nil {
		return Tenant{}, apperr.Internal("Tenant not found")
	}
	return Tenant{
		ID:     tenant.ID(),
		LMSKey: tenant.LMSKey(),
	}, nil
}
