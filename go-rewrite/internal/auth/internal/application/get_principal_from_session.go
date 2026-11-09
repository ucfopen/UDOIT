package application

import (
	"context"

	"rewritetest/internal/auth/internal/domain"
	"rewritetest/internal/shared/apperr"
	sharedAuth "rewritetest/internal/shared/auth"
)

type GetPrincipalFromSessionUseCase struct {
	sessionRepository domain.SessionRepository
}

type GetPrincipalFromSessionQuery struct {
	SessionID string
}

func NewGetPrincipalFromSessionUseCase(sessionRepo domain.SessionRepository) *GetPrincipalFromSessionUseCase {
	return &GetPrincipalFromSessionUseCase{
		sessionRepository: sessionRepo,
	}
}

func (uc *GetPrincipalFromSessionUseCase) Execute(ctx context.Context, query GetPrincipalFromSessionQuery) (sharedAuth.Principal, error) {
	session, err := uc.sessionRepository.GetByID(ctx, query.SessionID)
	if err != nil {
		return sharedAuth.Principal{}, err
	}
	if session == nil {
		return sharedAuth.Principal{}, apperr.Unauthorized()
	}

	return sharedAuth.Principal{
		AgentID:  session.UserID(),
		TenantID: session.TenantID(),
	}, nil
}
