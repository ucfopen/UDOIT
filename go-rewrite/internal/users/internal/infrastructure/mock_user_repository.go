package infrastructure

import (
	"context"

	"rewritetest/internal/users/internal/domain"
)

type MockUserRepository struct {
	GetByIDFunc func(ctx context.Context, id int64) (*domain.User, error)
	CreateFunc  func(ctx context.Context, user *domain.User) error
	UpdateFunc  func(ctx context.Context, user *domain.User) error

	GetByIDCallCount int
	CreateCallCount  int
	UpdateCallCount  int
}

func (m *MockUserRepository) GetByID(ctx context.Context, id int64) (*domain.User, error) {
	m.GetByIDCallCount++
	if m.GetByIDFunc != nil {
		return m.GetByIDFunc(ctx, id)
	}

	panic("GetByID function not implemented in MockUserRepository")
}

func (m *MockUserRepository) Create(ctx context.Context, user *domain.User) error {
	m.CreateCallCount++
	if m.CreateFunc != nil {
		return m.CreateFunc(ctx, user)
	}
	panic("Create function not implemented in MockUserRepository")
}

func (m *MockUserRepository) Update(ctx context.Context, user *domain.User) error {
	m.UpdateCallCount++
	if m.UpdateFunc != nil {
		return m.UpdateFunc(ctx, user)
	}
	panic("Update function not implemented in MockUserRepository")
}

var _ domain.UserRepository = &MockUserRepository{}

// Helper implementations

func NewMapMockUserRepository() *MockUserRepository {
	userMap := make(map[int64]*domain.User)

	return &MockUserRepository{
		GetByIDFunc: func(ctx context.Context, id int64) (*domain.User, error) {
			user, exists := userMap[id]
			if !exists {
				return nil, nil
			}
			return user, nil
		},
		CreateFunc: func(ctx context.Context, user *domain.User) error {
			userMap[user.ID()] = user
			return nil
		},
		UpdateFunc: func(ctx context.Context, user *domain.User) error {
			if _, exists := userMap[user.ID()]; !exists {
				return nil
			}
			userMap[user.ID()] = user
			return nil
		},
	}
}
