package infrastructure

import (
	"context"

	"rewritetest/internal/lti/internal/domain"
)

type MockLTIUserLinkRepository struct {
	GetBySubAndIssuerFunc func(ctx context.Context, sub string, issuer string) (*domain.LTIUserLink, error)
	CreateFunc            func(ctx context.Context, link *domain.LTIUserLink) error
}

func (m *MockLTIUserLinkRepository) GetBySubAndIssuer(ctx context.Context, sub string, issuer string) (*domain.LTIUserLink, error) {
	if m.GetBySubAndIssuerFunc != nil {
		return m.GetBySubAndIssuerFunc(ctx, sub, issuer)
	}

	panic("GetBySubAndIssuerFunc not implemented")
}

func (m *MockLTIUserLinkRepository) Create(ctx context.Context, link *domain.LTIUserLink) error {
	if m.CreateFunc != nil {
		return m.CreateFunc(ctx, link)
	}

	panic("CreateFunc not implemented")
}

var _ domain.LTIUserLinkRepository = (*MockLTIUserLinkRepository)(nil)

// Helper implementations

func NewMapMockLTIUserLinkRepository() *MockLTIUserLinkRepository {
	userLinks := map[string]*domain.LTIUserLink{}

	key := func(sub string, issuer string) string {
		return sub + "::" + issuer
	}

	return &MockLTIUserLinkRepository{
		GetBySubAndIssuerFunc: func(_ context.Context, sub string, issuer string) (*domain.LTIUserLink, error) {
			link, ok := userLinks[key(sub, issuer)]
			if !ok {
				return nil, nil
			}
			return link, nil
		},
		CreateFunc: func(_ context.Context, link *domain.LTIUserLink) error {
			userLinks[key(link.Sub(), link.Issuer())] = link
			return nil
		},
	}
}
