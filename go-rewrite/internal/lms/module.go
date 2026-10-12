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
	"rewritetest/internal/lmsdata"
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

func (m *Module) GetCourseContent(ctx context.Context, req lmsdata.GetCourseContentRequest) (lmsdata.ExternalCourseContent, error) {
	lmsProvider, err := m.providerResolver.GetByTenant(ctx, req.TenantID)
	if err != nil {
		return lmsdata.ExternalCourseContent{}, err
	}

	syncData, err := lmsProvider.GetContent(ctx, domain.LMSCourse{
		ID:           req.CourseID,
		ExternalID:   req.ExternalCourseID,
		ExternalData: req.ExternalCourseData,
	}, toLMSContent(req.CurrentContent), req.UserID)
	if err != nil {
		return lmsdata.ExternalCourseContent{}, err
	}

	contentItems := make([]lmsdata.ExternalContentItem, len(syncData.ContentItems))
	for i, item := range syncData.ContentItems {
		contentItems[i] = lmsdata.ExternalContentItem{
			ExternalID:   item.ExternalID,
			ExternalData: item.ExternalData,
			HTML:         item.HTML,
		}
	}

	files := make([]lmsdata.ExternalFile, len(syncData.Files))
	for i, file := range syncData.Files {
		files[i] = lmsdata.ExternalFile{
			FileName:     file.FileName,
			FileType:     file.FileType,
			UpdatedAt:    file.UpdatedAt,
			FileSize:     file.FileSize,
			DownloadURL:  file.DownloadURL,
			ExternalID:   file.ExternalID,
			ExternalData: file.ExternalData,
		}
	}

	return lmsdata.ExternalCourseContent{ContentItems: contentItems, Files: files}, nil
}

func toLMSContent(contentItems []lmsdata.ContentItem) []domain.LMSContent {
	content := make([]domain.LMSContent, len(contentItems))
	for i, item := range contentItems {
		content[i] = domain.LMSContent{
			ID:           item.ID,
			ExternalID:   item.ExternalID,
			ExternalData: item.ExternalData,
		}
	}
	return content
}

func (m *Module) ResolveFileReferences(ctx context.Context, req lmsdata.ResolveFileReferencesRequest) ([]lmsdata.ResolvedFileReference, error) {
	lmsProvider, err := m.providerResolver.GetByTenant(ctx, req.TenantID)
	if err != nil {
		return nil, err
	}

	references := make([]domain.ContentReference, len(req.References))
	for i, reference := range req.References {
		references[i] = domain.ContentReference{
			ContentExternalID: reference.ContentExternalID,
			Kind:              reference.Kind,
			TagName:           reference.TagName,
			Attribute:         reference.Attribute,
			Value:             reference.Value,
			XPath:             reference.XPath,
		}
	}

	files := make([]domain.CourseFile, len(req.PersistedFiles))
	for i, file := range req.PersistedFiles {
		files[i] = domain.CourseFile{
			FileName:     file.FileName,
			FileType:     file.FileType,
			UpdatedAt:    file.UpdatedAt,
			FileSize:     file.FileSize,
			DownloadURL:  file.DownloadURL,
			ExternalID:   file.ExternalID,
			ExternalData: file.ExternalData,
		}
	}

	resolved, err := lmsProvider.ResolveFileReferences(ctx, domain.LMSCourse{
		ID:           req.Course.ID,
		ExternalID:   req.Course.ExternalID,
		ExternalData: req.Course.ExternalData,
	}, references, files)
	if err != nil {
		return nil, err
	}

	result := make([]lmsdata.ResolvedFileReference, len(resolved))
	for i, reference := range resolved {
		result[i] = lmsdata.ResolvedFileReference{
			ContentExternalID: reference.ContentExternalID,
			FileExternalID:    reference.FileExternalID,
		}
	}

	return result, nil
}
