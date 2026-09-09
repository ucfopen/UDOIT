package domain

import "context"

type SessionRepository interface {
	Create(ctx context.Context, session Session) error
	GetByID(ctx context.Context, id string) (*Session, error)
	DeleteByID(ctx context.Context, id string) error
}
