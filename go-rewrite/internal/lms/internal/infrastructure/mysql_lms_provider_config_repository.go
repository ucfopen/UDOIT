package infrastructure

import (
	"context"
	"database/sql"
	"encoding/json"

	"rewritetest/internal/lms/internal/domain"
	lmssqlc "rewritetest/internal/lms/internal/infrastructure/sqlc"
	"rewritetest/internal/shared/apperr"
	"rewritetest/internal/shared/crypto"
)

type MySQLLMSProviderConfigRepository struct {
	queries *lmssqlc.Queries
	cipher  crypto.Cipher
}

func NewMySQLLMSProviderConfigRepository(db *sql.DB, cipher crypto.Cipher) *MySQLLMSProviderConfigRepository {
	return &MySQLLMSProviderConfigRepository{
		queries: lmssqlc.New(db),
		cipher:  cipher,
	}
}

func (r *MySQLLMSProviderConfigRepository) GetByTenant(ctx context.Context, tenantID int64) (*domain.LMSProviderConfig, error) {
	result, err := r.queries.GetLMSProviderConfigByTenant(ctx, uint64(tenantID))
	if err != nil {
		return nil, err
	}

	decryptedConfigJSON, err := r.cipher.Decrypt(ctx, crypto.EncryptedBlob{
		KeyID: result.ConfigEncryptionKeyID,
		Data:  result.EncryptedConfig,
	})
	if err != nil {
		return nil, err
	}

	var config map[string]any
	if err := json.Unmarshal(decryptedConfigJSON, &config); err != nil {
		return nil, err
	}

	lmsType, err := domain.ParseLMSType(result.LmsType)
	if err != nil {
		return nil, err
	}

	return domain.NewLMSProviderConfig(
		int64(result.TenantID),
		lmsType,
		config,
	), nil
}

func (r *MySQLLMSProviderConfigRepository) UpsertByTenant(ctx context.Context, tenantID int64, lmsKey domain.LMSType, data map[string]any) error {
	configJSON, err := json.Marshal(data)
	if err != nil {
		return apperr.Internal("Failed to marshal LMS provider config")
	}

	encryptedConfigJSON, err := r.cipher.Encrypt(ctx, configJSON)
	if err != nil {
		return err
	}

	return r.queries.UpsertLMSProviderConfigByTenant(ctx, lmssqlc.UpsertLMSProviderConfigByTenantParams{
		TenantID:              uint64(tenantID),
		LmsType:               string(lmsKey),
		EncryptedConfig:       encryptedConfigJSON.Data,
		ConfigEncryptionKeyID: encryptedConfigJSON.KeyID,
	})
}
