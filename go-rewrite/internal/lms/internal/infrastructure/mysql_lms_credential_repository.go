package infrastructure

import (
	"context"
	"database/sql"
	"encoding/json"
	"time"

	"rewritetest/internal/lms/internal/domain"
	lmssqlc "rewritetest/internal/lms/internal/infrastructure/sqlc"
	"rewritetest/internal/shared/crypto"
)

type MySQLLMSCredentialRepository struct {
	db      *sql.DB
	queries *lmssqlc.Queries
	cipher  crypto.Cipher
}

func NewMySQLLMSCredentialRepository(db *sql.DB, cipher crypto.Cipher) *MySQLLMSCredentialRepository {
	return &MySQLLMSCredentialRepository{
		db:      db,
		queries: lmssqlc.New(db),
		cipher:  cipher,
	}
}

func (r *MySQLLMSCredentialRepository) UpsertActive(ctx context.Context, credential domain.LMSCredential) error {
	payloadJSON, err := json.Marshal(credential.Payload())
	if err != nil {
		return err
	}

	encryptedCredential, err := r.cipher.Encrypt(ctx, payloadJSON)
	if err != nil {
		return err
	}

	err = r.queries.UpsertLMSUserCredential(ctx, lmssqlc.UpsertLMSUserCredentialParams{
		UserID:                    uint64(credential.UserID()),
		LmsKey:                    string(credential.LMSKey()),
		CredentialEncryptionKeyID: encryptedCredential.KeyID,
		EncryptedCredential:       encryptedCredential.Data,
		ExpiresAt:                 nullableTime(credential.ExpiresAt()),
	})

	return err
}

func (r *MySQLLMSCredentialRepository) GetActiveByUser(ctx context.Context, userID int64) (*domain.LMSCredential, error) {
	result, err := r.queries.GetActiveLMSUserCredentialByUserID(ctx, uint64(userID))
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	payload := map[string]any{}
	if len(result.EncryptedCredential) > 0 {
		decryptedPayloadRaw, err := r.cipher.Decrypt(ctx, crypto.EncryptedBlob{
			KeyID: result.CredentialEncryptionKeyID,
			Data:  result.EncryptedCredential,
		})
		if err != nil {
			return nil, err
		}

		if err := json.Unmarshal(decryptedPayloadRaw, &payload); err != nil {
			return nil, err
		}
	}

	credential, err := domain.RehydrateLMSCredential(
		int64(result.UserID),
		result.LmsKey,
		payload,
		nullTimePtr(result.ExpiresAt),
		result.IsActive,
		result.CreatedAt,
		result.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &credential, nil
}

func nullableTime(value *time.Time) sql.NullTime {
	if value == nil {
		return sql.NullTime{Valid: false}
	}
	return sql.NullTime{
		Time:  *value,
		Valid: true,
	}
}

func nullTimePtr(value sql.NullTime) *time.Time {
	if !value.Valid {
		return nil
	}
	copy := value.Time
	return &copy
}

var _ domain.LMSCredentialRepository = (*MySQLLMSCredentialRepository)(nil)
