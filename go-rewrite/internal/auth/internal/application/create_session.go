package application

import (
	"context"
	"time"

	"rewritetest/internal/auth/internal/domain"

	"github.com/google/uuid"
)

type CreateSessionUseCase struct {
	sessionRepository domain.SessionRepository
}

type CreateSessionCommand struct {
	UserID   int64
	TenantID int64
	TTL      time.Duration
}

type CreateSessionResponse struct {
	SessionID string
	ExpiresIn int
}

func NewCreateSessionUseCase(sessionRepository domain.SessionRepository) *CreateSessionUseCase {
	return &CreateSessionUseCase{
		sessionRepository: sessionRepository,
	}
}

func (u *CreateSessionUseCase) Execute(ctx context.Context, cmd CreateSessionCommand) (CreateSessionResponse, error) {
	sessionID := uuid.NewString()
	session := domain.NewSession(sessionID, cmd.UserID, cmd.TenantID, time.Now(), time.Now().Add(cmd.TTL))
	if err := u.sessionRepository.Create(ctx, session); err != nil {
		return CreateSessionResponse{}, err
	}

	return CreateSessionResponse{
		SessionID: session.ID(),
		ExpiresIn: int(cmd.TTL.Seconds()),
	}, nil
}
