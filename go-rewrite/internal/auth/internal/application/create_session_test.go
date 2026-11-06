package application

import (
	"context"
	"testing"
	"time"

	"rewritetest/internal/auth/internal/infrastructure"

	"github.com/stretchr/testify/require"
)

func TestCreateSession_Success(t *testing.T) {
	sessionRepo := infrastructure.NewMapMockSessionRepository()

	uc := NewCreateSessionUseCase(sessionRepo)
	resp, err := uc.Execute(context.Background(), CreateSessionCommand{
		UserID:   1,
		TenantID: 5,
		TTL:      time.Minute * 10,
	})
	require.NoError(t, err)

	repoSession, err := sessionRepo.GetByID(context.Background(), resp.SessionID)
	require.NoError(t, err)

	require.NotNil(t, repoSession)
	require.Equal(t, resp.SessionID, repoSession.ID())
	require.Equal(t, int64(1), repoSession.UserID())
	require.Equal(t, int64(5), repoSession.TenantID())
	require.WithinDuration(t, time.Now().Add(time.Minute*10), repoSession.ExpiresAt(), time.Second)
}
