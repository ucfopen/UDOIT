package lms

import (
	"database/sql"
	"encoding/base64"
	"fmt"
	"strings"
	"time"

	"rewritetest/internal/lms/internal"
	"rewritetest/internal/lms/internal/application"
	"rewritetest/internal/lms/internal/domain"
	"rewritetest/internal/lms/internal/infrastructure"
	"rewritetest/internal/shared/crypto"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

type Module struct {
	providerResolver         domain.LMSProviderResolver
	providerConfigRepository domain.LMSProviderConfigRepository
	courseRepository         domain.CourseRepository
	contentItemRepository    domain.ContentItemRepository
	createCourseUseCase      *application.CreateCourseUseCase
	handler                  *internal.Handler
}

func New(db *sql.DB, client *redis.Client, baseURL string, encryptionKeyB64 string) (*Module, error) {
	authAttemptTTL := time.Hour

	encryptionKey, err := base64.StdEncoding.DecodeString(strings.TrimSpace(encryptionKeyB64))
	if err != nil {
		return nil, err
	}

	keyManager, err := crypto.NewAESKeyManager(encryptionKey)
	if err != nil {
		return nil, err
	}

	payloadCipher := crypto.NewEnvelopeCipher(keyManager, "envelope-v1")

	credentialRepository := infrastructure.NewMySQLLMSCredentialRepository(db, payloadCipher)
	providerConfigRepository := infrastructure.NewMySQLLMSProviderConfigRepository(db, payloadCipher)
	courseRepository := infrastructure.NewMySQLCourseRepository(db)
	contentItemRepository := infrastructure.NewMySQLContentItemRepository(db)
	createCourseUseCase := application.NewCreateCourseUseCase(courseRepository)
	authAttemptRepository := infrastructure.NewRedisAuthAttemptRepository(client, authAttemptTTL, "auth_attempt:")

	// LMS providers

	oauthRedirectURI := fmt.Sprintf("%s/oauth/callback", baseURL)

	providerResolver := infrastructure.NewTenantLMSProviderResolver(providerConfigRepository, credentialRepository, authAttemptRepository, oauthRedirectURI)

	processOAuthRedirectUseCase := application.NewProcessOAuthRedirectUseCase(providerResolver, providerConfigRepository, authAttemptRepository)

	handler := internal.NewHandler(processOAuthRedirectUseCase)

	return &Module{
		providerResolver:         providerResolver,
		providerConfigRepository: providerConfigRepository,
		courseRepository:         courseRepository,
		contentItemRepository:    contentItemRepository,
		createCourseUseCase:      createCourseUseCase,
		handler:                  handler,
	}, nil
}

func (m *Module) RegisterRoutes(rg *gin.RouterGroup) {
	m.handler.RegisterRoutes(rg)
}
