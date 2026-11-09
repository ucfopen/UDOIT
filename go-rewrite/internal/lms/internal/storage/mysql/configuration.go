package mysql

import (
	"context"
	"database/sql"
	"encoding/json"

	"rewritetest/internal/lms/internal/record"
	lmssqlc "rewritetest/internal/lms/internal/storage/mysql/sqlc"
	"rewritetest/internal/shared/apperr"
	"rewritetest/internal/shared/crypto"
)

func (r *Store) ProviderConfiguration(ctx context.Context, tenantID int64) (record.ProviderConfiguration, bool, error) {
	result, err := r.queries.GetLMSProviderConfigByTenant(ctx, uint64(tenantID))
	if err != nil {
		if err == sql.ErrNoRows {
			return record.ProviderConfiguration{}, false, nil
		}
		return record.ProviderConfiguration{}, false, err
	}

	decryptedConfigJSON, err := r.cipher.Decrypt(ctx, crypto.EncryptedBlob{
		KeyID: result.ConfigEncryptionKeyID,
		Data:  result.EncryptedConfig,
	})
	if err != nil {
		return record.ProviderConfiguration{}, false, err
	}

	var config map[string]any
	if err := json.Unmarshal(decryptedConfigJSON, &config); err != nil {
		return record.ProviderConfiguration{}, false, err
	}

	return record.ProviderConfiguration{TenantID: int64(result.TenantID), LMSKey: result.LmsType, Data: config}, true, nil
}

func (r *Store) SaveProviderConfiguration(ctx context.Context, configuration record.ProviderConfiguration) error {
	configJSON, err := json.Marshal(configuration.Data)
	if err != nil {
		return apperr.Internal("Failed to marshal LMS provider config")
	}

	encryptedConfigJSON, err := r.cipher.Encrypt(ctx, configJSON)
	if err != nil {
		return err
	}

	return r.queries.UpsertLMSProviderConfigByTenant(ctx, lmssqlc.UpsertLMSProviderConfigByTenantParams{
		TenantID:              uint64(configuration.TenantID),
		LmsType:               configuration.LMSKey,
		EncryptedConfig:       encryptedConfigJSON.Data,
		ConfigEncryptionKeyID: encryptedConfigJSON.KeyID,
	})
}
