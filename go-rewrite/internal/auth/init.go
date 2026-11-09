package auth

import (
	"time"

	"rewritetest/internal/auth/internal/application"
	"rewritetest/internal/auth/internal/infrastructure"

	"github.com/redis/go-redis/v9"
)

type Module struct {
	createSessionUseCase           *application.CreateSessionUseCase
	sessionTTL                     time.Duration
	getPrincipalFromSessionUseCase *application.GetPrincipalFromSessionUseCase
}

func New(client *redis.Client) *Module {
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
