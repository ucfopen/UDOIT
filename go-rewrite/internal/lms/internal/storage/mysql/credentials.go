package mysql

import (
	"context"
	"database/sql"
	"encoding/json"
	"time"

	"rewritetest/internal/lms/internal/record"
	lmssqlc "rewritetest/internal/lms/internal/storage/mysql/sqlc"
	"rewritetest/internal/shared/crypto"
)

func (r *Store) SaveCredential(ctx context.Context, credential record.LMSCredential) error {
	payloadJSON, err := json.Marshal(credential.Payload)
	if err != nil {
		return err
	}

	encryptedCredential, err := r.cipher.Encrypt(ctx, payloadJSON)
	if err != nil {
		return err
	}

	err = r.queries.UpsertLMSUserCredential(ctx, lmssqlc.UpsertLMSUserCredentialParams{
		UserID:                    uint64(credential.UserID),
		LmsKey:                    credential.LMSKey,
		CredentialEncryptionKeyID: encryptedCredential.KeyID,
		EncryptedCredential:       encryptedCredential.Data,
		ExpiresAt:                 nullableTime(credential.ExpiresAt),
	})

	return err
}

func (r *Store) ActiveCredential(ctx context.Context, userID int64) (record.LMSCredential, bool, error) {
	result, err := r.queries.GetActiveLMSUserCredentialByUserID(ctx, uint64(userID))
	if err != nil {
		if err == sql.ErrNoRows {
			return record.LMSCredential{}, false, nil
		}
		return record.LMSCredential{}, false, err
	}

	payload := map[string]any{}
	if len(result.EncryptedCredential) > 0 {
		decryptedPayloadRaw, err := r.cipher.Decrypt(ctx, crypto.EncryptedBlob{
			KeyID: result.CredentialEncryptionKeyID,
			Data:  result.EncryptedCredential,
		})
		if err != nil {
			return record.LMSCredential{}, false, err
		}

		if err := json.Unmarshal(decryptedPayloadRaw, &payload); err != nil {
			return record.LMSCredential{}, false, err
		}
	}
	return record.LMSCredential{UserID: int64(result.UserID), LMSKey: result.LmsKey, Payload: payload, ExpiresAt: nullTimePtr(result.ExpiresAt), Active: result.IsActive, CreatedAt: result.CreatedAt, UpdatedAt: result.UpdatedAt}, true, nil
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
