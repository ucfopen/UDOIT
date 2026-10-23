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
	return m.registerTenantUseCase.Execute(ctx, application.RegisterTenantCommand{LMSKey: lmsKey})
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
