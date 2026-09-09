package infrastructure

import (
	"context"
	"strconv"

	"rewritetest/internal/lti/internal/domain"
)

type MockLTICourseLinkRepository struct {
	CreateFunc                func(ctx context.Context, link domain.LTICourseLink) error
	GetByTenantAndContextFunc func(ctx context.Context, tenantID int64, contextID string) (domain.LTICourseLink, error)
}

func (m *MockLTICourseLinkRepository) Create(ctx context.Context, link domain.LTICourseLink) error {
	if m.CreateFunc != nil {
		return m.CreateFunc(ctx, link)
	}

	panic("CreateFunc not implemented")
}

func (m *MockLTICourseLinkRepository) GetByTenantAndContext(ctx context.Context, tenantID int64, contextID string) (domain.LTICourseLink, error) {
	if m.GetByTenantAndContextFunc != nil {
		return m.GetByTenantAndContextFunc(ctx, tenantID, contextID)
	}

	panic("GetByTenantAndContextFunc not implemented")
}

var _ domain.LTICourseLinkRepository = (*MockLTICourseLinkRepository)(nil)

// Helper implementations

func NewMapMockLTICourseLinkRepository() *MockLTICourseLinkRepository {
	courseLinks := map[string]domain.LTICourseLink{}

	key := func(tenantID int64, contextID string) string {
		return strconv.FormatInt(tenantID, 10) + "::" + contextID
	}

	return &MockLTICourseLinkRepository{
		CreateFunc: func(_ context.Context, link domain.LTICourseLink) error {
			courseLinks[key(link.TenantID(), link.ContextID())] = link
			return nil
		},
		GetByTenantAndContextFunc: func(_ context.Context, tenantID int64, contextID string) (domain.LTICourseLink, error) {
			link, ok := courseLinks[key(tenantID, contextID)]
			if !ok {
				return domain.LTICourseLink{}, nil
			}
			return link, nil
		},
	}
}
