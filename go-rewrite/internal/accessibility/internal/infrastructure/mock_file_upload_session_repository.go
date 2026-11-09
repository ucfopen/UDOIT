package infrastructure

import (
	"context"

	"rewritetest/internal/accessibility/internal/domain"
)

type MockFileUploadSessionRepository struct {
	CreateFunc     func(ctx context.Context, session domain.FileUploadSession) (domain.FileUploadSession, error)
	GetByIDFunc    func(ctx context.Context, id string) (*domain.FileUploadSession, error)
	DeleteByIDFunc func(ctx context.Context, id string) error
}

func (m *MockFileUploadSessionRepository) Create(ctx context.Context, session domain.FileUploadSession) (domain.FileUploadSession, error) {
	if m.CreateFunc != nil {
		return m.CreateFunc(ctx, session)
	}
	panic("CreateFunc not implemented")
}

func (m *MockFileUploadSessionRepository) GetByID(ctx context.Context, id string) (*domain.FileUploadSession, error) {
	if m.GetByIDFunc != nil {
		return m.GetByIDFunc(ctx, id)
	}
	panic("GetByIDFunc not implemented")
}

func (m *MockFileUploadSessionRepository) DeleteByID(ctx context.Context, id string) error {
	if m.DeleteByIDFunc != nil {
		return m.DeleteByIDFunc(ctx, id)
	}
	panic("DeleteByIDFunc not implemented")
}

var _ domain.FileUploadSessionRepository = (*MockFileUploadSessionRepository)(nil)

func NewMapMockFileUploadSessionRepository() *MockFileUploadSessionRepository {
	sessions := make(map[string]domain.FileUploadSession)
	return &MockFileUploadSessionRepository{
		CreateFunc: func(_ context.Context, session domain.FileUploadSession) (domain.FileUploadSession, error) {
			sessions[session.ID] = session
			return session, nil
		},
		GetByIDFunc: func(_ context.Context, id string) (*domain.FileUploadSession, error) {
			session, ok := sessions[id]
			if !ok {
				return nil, nil
			}
			return &session, nil
		},
		DeleteByIDFunc: func(_ context.Context, id string) error {
			delete(sessions, id)
			return nil
		},
	}
}
