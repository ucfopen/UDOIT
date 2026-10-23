package auth

import (
	"context"
	"rewritetest/internal/auth/internal"
	"rewritetest/internal/auth/internal/application"
	"time"

	"github.com/gin-gonic/gin"
)

type Authenticator interface {
	WithAuth() gin.HandlerFunc
}

type Session struct {
	ID        string
	UserID    int64
	ExpiresAt time.Time
}

var _ Authenticator = (*Module)(nil)

func (m *Module) CreateSession(ctx context.Context, userID int64, tenantID int64) (Session, error) {
	createSessionCommand := application.CreateSessionCommand{
		UserID:   userID,
		TenantID: tenantID,
		TTL:      m.sessionTTL,
	}

	sessionResponse, err := m.createSessionUseCase.Execute(ctx, createSessionCommand)
	if err != nil {
		return Session{}, err
	}

	return Session{
		ID:        sessionResponse.SessionID,
		UserID:    userID,
		ExpiresAt: time.Now().Add(time.Duration(sessionResponse.ExpiresIn) * time.Second),
	}, nil
}

func (m *Module) WithAuth() gin.HandlerFunc {
	return internal.GetAuthMiddleware(m.getPrincipalFromSessionUseCase)
}
