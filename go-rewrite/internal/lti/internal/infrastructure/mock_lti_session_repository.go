package infrastructure

import (
	"context"

	"rewritetest/internal/lti/internal/domain"
)

type MockLTISessionRepository struct {
	CreateFunc     func(ctx context.Context, session *domain.LTISession) error
	GetByStateFunc func(ctx context.Context, state string) (*domain.LTISession, error)
	DeleteFunc     func(ctx context.Context, sessionID string) error
}

func (m *MockLTISessionRepository) Create(ctx context.Context, session *domain.LTISession) error {
	if m.CreateFunc != nil {
		return m.CreateFunc(ctx, session)
	}

	panic("CreateFunc not implemented")
}

func (m *MockLTISessionRepository) GetByState(ctx context.Context, state string) (*domain.LTISession, error) {
	if m.GetByStateFunc != nil {
		return m.GetByStateFunc(ctx, state)
	}

	panic("GetByStateFunc not implemented")
}

func (m *MockLTISessionRepository) Delete(ctx context.Context, sessionID string) error {
	if m.DeleteFunc != nil {
		return m.DeleteFunc(ctx, sessionID)
	}

	panic("DeleteFunc not implemented")
}

var _ domain.LTISessionRepository = (*MockLTISessionRepository)(nil)

// Helper implementations

func NewMapMockLTISessionRepository() *MockLTISessionRepository {
	sessions := map[string]*domain.LTISession{}

	return &MockLTISessionRepository{
		CreateFunc: func(_ context.Context, session *domain.LTISession) error {
			sessions[session.State()] = session
			return nil
		},
		GetByStateFunc: func(_ context.Context, state string) (*domain.LTISession, error) {
			session, ok := sessions[state]
			if !ok {
				return nil, nil
			}
			return session, nil
		},
		DeleteFunc: func(_ context.Context, sessionID string) error {
			delete(sessions, sessionID)
			return nil
		},
	}
}
