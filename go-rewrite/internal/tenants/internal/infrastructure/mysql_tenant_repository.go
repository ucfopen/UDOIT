package infrastructure

import (
	"context"
	"database/sql"

	"rewritetest/internal/tenants/internal/domain"
	tenantssqlc "rewritetest/internal/tenants/internal/infrastructure/sqlc"
)

type MySQLTenantRepository struct {
	queries *tenantssqlc.Queries
}

func NewMySQLTenantRepository(db *sql.DB) *MySQLTenantRepository {
	return &MySQLTenantRepository{queries: tenantssqlc.New(db)}
}

func (r *MySQLTenantRepository) Create(ctx context.Context, lmsKey string) (*domain.Tenant, error) {
	result, err := r.queries.CreateTenant(ctx, lmsKey)
	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	row, err := r.queries.GetByID(ctx, uint64(id))
	if err != nil {
		return nil, err
	}
	return domain.NewTenant(int64(row.ID), row.LmsKey), nil
}

func (r *MySQLTenantRepository) GetByID(ctx context.Context, tenantID int64) (*domain.Tenant, error) {
	tenant, err := r.queries.GetByID(ctx, uint64(tenantID))
	if err != nil {
		return nil, err
	}

	return domain.NewTenant(int64(tenant.ID), tenant.LmsKey), nil
}

var _ domain.TenantRepository = (*MySQLTenantRepository)(nil)
