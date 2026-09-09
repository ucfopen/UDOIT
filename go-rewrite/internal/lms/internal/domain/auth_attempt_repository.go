package domain

import "context"

type AuthAttemptRepository interface {
	Create(ctx context.Context, authAttempt AuthAttempt) error
	GetByState(ctx context.Context, state string) (AuthAttempt, error)
}
