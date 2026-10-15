package domain

import "context"

type LTISessionRepository interface {
	Create(ctx context.Context, session *LTISession) error
	GetByState(ctx context.Context, state string) (*LTISession, error)
	Delete(ctx context.Context, sessionID string) error
}
