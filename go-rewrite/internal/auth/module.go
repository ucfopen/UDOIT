package auth

import (
	"context"
	"database/sql"
	"time"

	"rewritetest/internal/auth/internal"
	"rewritetest/internal/auth/internal/application"
	"rewritetest/internal/auth/internal/infrastructure"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

type Module struct {
	createSessionUseCase           *application.CreateSessionUseCase
	sessionTTL                     time.Duration
	getPrincipalFromSessionUseCase *application.GetPrincipalFromSessionUseCase
}

type Session struct {
	ID        string
	UserID    int64
	ExpiresAt time.Time
}

func New(client *redis.Client, db *sql.DB) *Module {
	sessionTTL := 24 * time.Hour

	redisSessionRepository := infrastructure.NewRedisSessionRepository(client, sessionTTL, "session:")
	// mysqlSessionRepository := infrastructure.NewMySQLSessionRepository(db)

	createSessionUseCase := application.NewCreateSessionUseCase(redisSessionRepository)
	getPrincipalFromSessionUseCase := application.NewGetPrincipalFromSessionUseCase(redisSessionRepository)

	return &Module{
		createSessionUseCase:           createSessionUseCase,
		sessionTTL:                     sessionTTL,
		getPrincipalFromSessionUseCase: getPrincipalFromSessionUseCase,
	}
}

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
