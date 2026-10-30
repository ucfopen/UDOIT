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

func (u *RegisterTenantUseCase) Execute(ctx context.Context, cmd RegisterTenantCommand) (int64, error) {
	if !u.lmsTypeValidator.IsValidLMSType(cmd.LMSKey) {
		return 0, apperr.Validation("Invalid LMS type")
	}

	return u.tenantRepository.Create(ctx, cmd.LMSKey)
}
