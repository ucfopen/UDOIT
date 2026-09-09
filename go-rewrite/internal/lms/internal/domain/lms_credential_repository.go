package domain

import "context"

type LMSCredentialRepository interface {
	UpsertActive(ctx context.Context, credential LMSCredential) error
	GetActiveByUser(ctx context.Context, userID int64) (*LMSCredential, error)
}
