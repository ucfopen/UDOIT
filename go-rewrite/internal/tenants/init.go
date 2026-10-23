package tenants

import (
	"database/sql"

	"rewritetest/internal/tenants/internal/application"
	"rewritetest/internal/tenants/internal/domain"
	"rewritetest/internal/tenants/internal/infrastructure"
)

type Module struct {
	registerTenantUseCase *application.RegisterTenantUseCase
	tenantRepository      domain.TenantRepository
}

func New(db *sql.DB, lmsTypeValidator application.LMSTypeValidator) *Module {
	tenantRepository := infrastructure.NewMySQLTenantRepository(db)
	registerTenantUseCase := application.NewRegisterTenantUseCase(tenantRepository, lmsTypeValidator)

	return &Module{
		registerTenantUseCase: registerTenantUseCase,
		tenantRepository:      tenantRepository,
	}
}
