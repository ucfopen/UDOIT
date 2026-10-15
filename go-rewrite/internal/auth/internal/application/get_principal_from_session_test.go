package application

import (
	"context"
	"errors"
	"testing"
	"time"

	"rewritetest/internal/auth/internal/domain"
	"rewritetest/internal/auth/internal/infrastructure"
	"rewritetest/internal/shared/apperr"

	"github.com/stretchr/testify/require"
)

func TestGetPrincipalFromSession_Success(t *testing.T) {
	sessionRepo := infrastructure.NewMapMockSessionRepository()
	createdAt := time.Now()
	expiresAt := createdAt.Add(10 * time.Minute)

	err := sessionRepo.Create(context.Background(), domain.NewSession("session-1", 7, 9, createdAt, expiresAt))
	require.NoError(t, err)

	uc := NewGetPrincipalFromSessionUseCase(sessionRepo)
	principal, err := uc.Execute(context.Background(), GetPrincipalFromSessionQuery{SessionID: "session-1"})

	require.NoError(t, err)
	require.Equal(t, int64(7), principal.AgentID)
	require.Equal(t, int64(9), principal.TenantID)
}

func TestGetPrincipalFromSession_MissingSessionIsUnauthorized(t *testing.T) {
	sessionRepo := infrastructure.NewMapMockSessionRepository()
	uc := NewGetPrincipalFromSessionUseCase(sessionRepo)

	_, err := uc.Execute(context.Background(), GetPrincipalFromSessionQuery{SessionID: "missing"})

	require.Error(t, err)
	require.True(t, apperr.IsCode(err, apperr.CodeUnauthorized))
}

func TestGetPrincipalFromSession_RepositoryErrorIsReturned(t *testing.T) {
	expectedErr := errors.New("redis unavailable")
	sessionRepo := &infrastructure.MockSessionRepository{
		GetByIDFunc: func(context.Context, string) (*domain.Session, error) {
			return nil, expectedErr
		},
	}
	uc := NewGetPrincipalFromSessionUseCase(sessionRepo)

	_, err := uc.Execute(context.Background(), GetPrincipalFromSessionQuery{SessionID: "session-1"})

	require.ErrorIs(t, err, expectedErr)
}
