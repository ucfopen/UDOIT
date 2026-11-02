package application

import (
	"context"

	"rewritetest/internal/shared/apperr"
	"rewritetest/internal/tenants/internal/domain"
)

type RegisterTenantUseCase struct {
	tenantRepository domain.TenantRepository
	lmsTypeValidator LMSTypeValidator
}

type RegisterTenantCommand struct {
	LMSKey string
}

type LMSTypeValidator interface {
	IsValidLMSType(lmsKey string) bool
}

func NewRegisterTenantUseCase(tenantRepository domain.TenantRepository, lmsTypeValidator LMSTypeValidator) *RegisterTenantUseCase {
	return &RegisterTenantUseCase{
		tenantRepository: tenantRepository,
		lmsTypeValidator: lmsTypeValidator,
	}
}

func (u *RegisterTenantUseCase) Execute(ctx context.Context, cmd RegisterTenantCommand) (*domain.Tenant, error) {
	if !u.lmsTypeValidator.IsValidLMSType(cmd.LMSKey) {
		return nil, apperr.Validation("Invalid LMS type")
	}

	tenant, err := u.tenantRepository.Create(ctx, cmd.LMSKey)
	if err != nil {
		return nil, err
	}
	if tenant == nil {
		return nil, apperr.Internal("Tenant repository returned no persisted tenant")
	}
	return tenant, nil
}
