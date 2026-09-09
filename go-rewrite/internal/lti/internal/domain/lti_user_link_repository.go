package domain

import "context"

type LTIUserLinkRepository interface {
	GetBySubAndIssuer(ctx context.Context, sub, issuer string) (*LTIUserLink, error)
	Create(ctx context.Context, link *LTIUserLink) error
}
