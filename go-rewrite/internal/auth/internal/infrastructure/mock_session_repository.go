package infrastructure

import (
	"context"

	"rewritetest/internal/auth/internal/domain"
)

type MockSessionRepository struct {
	CreateFunc     func(ctx context.Context, session domain.Session) error
	GetByIDFunc    func(ctx context.Context, id string) (*domain.Session, error)
	DeleteByIDFunc func(ctx context.Context, id string) error
}

func (m *MockSessionRepository) Create(ctx context.Context, session domain.Session) error {
	if m.CreateFunc != nil {
		return m.CreateFunc(ctx, session)
	}

	panic("CreateFunc not implemented")
}

func (m *MockSessionRepository) GetByID(ctx context.Context, id string) (*domain.Session, error) {
	if m.GetByIDFunc != nil {
		return m.GetByIDFunc(ctx, id)
	}
	panic("GetByIDFunc not implemented")
}

func (m *MockSessionRepository) DeleteByID(ctx context.Context, id string) error {
	if m.DeleteByIDFunc != nil {
		return m.DeleteByIDFunc(ctx, id)
	}
	panic("DeleteByIDFunc not implemented")
}

var _ domain.SessionRepository = (*MockSessionRepository)(nil)

// Helper implementations

func NewMapMockSessionRepository() *MockSessionRepository {
	sessions := map[string]domain.Session{}

	return &MockSessionRepository{
		CreateFunc: func(ctx context.Context, session domain.Session) error {
			sessions[session.ID()] = session
			return nil
		},
		GetByIDFunc: func(ctx context.Context, id string) (*domain.Session, error) {
			s, ok := sessions[id]
			if !ok {
				return nil, nil
			}
			return &s, nil
		},
		DeleteByIDFunc: func(ctx context.Context, id string) error {
			delete(sessions, id)
			return nil
		},
	}
}
