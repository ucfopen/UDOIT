package lms

import (
	"context"
	"database/sql"
	"encoding/base64"
	"fmt"
	"strings"
	"time"

	"rewritetest/internal/lms/internal"
	"rewritetest/internal/lms/internal/application"
	"rewritetest/internal/lms/internal/domain"
	"rewritetest/internal/lms/internal/infrastructure"
	"rewritetest/internal/lms/internal/infrastructure/providers/canvas"
	"rewritetest/internal/shared/apperr"
	"rewritetest/internal/shared/crypto"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

type Module struct {
	providerResolver         domain.LMSProviderResolver
	providerConfigRepository domain.LMSProviderConfigRepository
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
	authAttemptRepository := infrastructure.NewRedisAuthAttemptRepository(client, authAttemptTTL, "auth_attempt:")

	// LMS providers

	oauthRedirectURI := fmt.Sprintf("%s/oauth/callback", baseURL)

	providerResolver := infrastructure.NewTenantLMSProviderResolver(providerConfigRepository, credentialRepository, authAttemptRepository, oauthRedirectURI)

	processOAuthRedirectUseCase := application.NewProcessOAuthRedirectUseCase(providerResolver, providerConfigRepository, authAttemptRepository)

	handler := internal.NewHandler(processOAuthRedirectUseCase)

	return &Module{
		providerResolver:         providerResolver,
		providerConfigRepository: providerConfigRepository,
		handler:                  handler,
	}, nil
}

func (m *Module) RegisterRoutes(rg *gin.RouterGroup) {
	m.handler.RegisterRoutes(rg)
}

func (m *Module) IsValidLMSType(lmsKey string) bool {
	lmsType := domain.LMSType(lmsKey)
	return lmsType.IsValid()
}

func (m *Module) SaveProviderConfig(ctx context.Context, tenantID int64, lmsKey string, configData map[string]any) error {
	return m.providerConfigRepository.UpsertByTenant(ctx, tenantID, domain.LMSType(lmsKey), configData)
}

func (m *Module) ValidateProviderConfig(ctx context.Context, lmsKey string, configData map[string]any) error {
	lmsType, err := domain.ParseLMSType(lmsKey)
	if err != nil {
		return err
	}

	// This is a second switch statement (the first one found in the provider
	// resolver). Abstracting it into some registry could be valuable in the
	// future.
	switch lmsType {
	case domain.LMSTypeCanvas:
		return canvas.ValidateConfig(configData)
	default:
		return apperr.Internal("The provided LMS type is not supported")
	}
}

type ContentItemDTO struct {
	ExternalID   string
	ExternalData map[string]any
	HTML         string
}

type FileItemDTO struct {
	ID           int64
	FileName     string
	FileType     string
	UpdatedAt    time.Time
	FileSize     int64
	DownloadURL  string
	ExternalID   string
	ExternalData map[string]any
}

type CourseSyncDataDTO struct {
	ContentItems []ContentItemDTO
	Files        []FileItemDTO
}

type GetContentRequest struct {
	CourseID           int64
	ExternalCourseID   string
	ExternalCourseData map[string]any
	TenantID           int64
	UserID             int64
}

func (m *Module) GetContent(ctx context.Context, req GetContentRequest) (CourseSyncDataDTO, error) {
	lmsProvider, err := m.providerResolver.GetByTenant(ctx, req.TenantID)
	if err != nil {
		return CourseSyncDataDTO{}, err
	}

	syncData, err := lmsProvider.GetContent(ctx, domain.LMSCourse{
		ID:           req.CourseID,
		ExternalID:   req.ExternalCourseID,
		ExternalData: req.ExternalCourseData,
	}, []domain.LMSContent{}, req.UserID)
	if err != nil {
		return CourseSyncDataDTO{}, err
	}

	contentItemDTOs := make([]ContentItemDTO, len(syncData.ContentItems))
	for i, item := range syncData.ContentItems {
		contentItemDTOs[i] = ContentItemDTO{
			ExternalID:   item.ExternalID,
			ExternalData: item.ExternalData,
			HTML:         item.HTML,
		}
	}

	fileDTOs := make([]FileItemDTO, len(syncData.Files))
	for i, file := range syncData.Files {
		fileDTOs[i] = FileItemDTO{
			FileName:     file.FileName,
			FileType:     file.FileType,
			UpdatedAt:    file.UpdatedAt,
			FileSize:     file.FileSize,
			DownloadURL:  file.DownloadURL,
			ExternalID:   file.ExternalID,
			ExternalData: file.ExternalData,
		}
	}

	return CourseSyncDataDTO{
		ContentItems: contentItemDTOs,
		Files:        fileDTOs,
	}, nil
}
