package tenants

import (
	"context"
	"database/sql"

	"rewritetest/internal/shared/apperr"
	"rewritetest/internal/tenants/internal/application"
	"rewritetest/internal/tenants/internal/domain"
	"rewritetest/internal/tenants/internal/infrastructure"
)

type Module struct {
	registerTenantUseCase *application.RegisterTenantUseCase
	tenantRepository      domain.TenantRepository
}

type Tenant struct {
	ID     int64
	LMSKey string
}

func New(db *sql.DB, lmsTypeValidator application.LMSTypeValidator) *Module {
	tenantRepository := infrastructure.NewMySQLTenantRepository(db)
	registerTenantUseCase := application.NewRegisterTenantUseCase(tenantRepository, lmsTypeValidator)

	return &Module{
		registerTenantUseCase: registerTenantUseCase,
		tenantRepository:      tenantRepository,
	}
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
