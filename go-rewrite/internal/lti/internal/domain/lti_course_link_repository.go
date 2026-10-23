package domain

import "context"

type LTICourseLinkRepository interface {
	Create(ctx context.Context, link LTICourseLink) error
	GetByTenantAndContext(ctx context.Context, tenantID int64, contextID string) (LTICourseLink, error)
}
