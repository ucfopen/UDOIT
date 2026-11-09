package infrastructure

import (
	"context"

	"rewritetest/internal/accessibility/internal/domain"
)

type MockHTMLIssueRepository struct {
	GetByIDFunc     func(ctx context.Context, id int64) (*domain.HTMLIssue, error)
	UpdateFunc      func(ctx context.Context, issue *domain.HTMLIssue) error
	GetByCourseFunc func(ctx context.Context, courseID int64) ([]*domain.HTMLIssue, error)
	CreateManyFunc  func(ctx context.Context, issues []*domain.HTMLIssue) ([]*domain.HTMLIssue, error)
	DeleteByIDsFunc func(ctx context.Context, contentItemIDs []int64) error
}

func (m *MockHTMLIssueRepository) DeleteByContentItemIDs(ctx context.Context, ids []int64) error {
	if m.DeleteByIDsFunc != nil {
		return m.DeleteByIDsFunc(ctx, ids)
	}
	panic("DeleteByIDsFunc not implemented")
}

func (m *MockHTMLIssueRepository) CreateMany(ctx context.Context, issues []*domain.HTMLIssue) ([]*domain.HTMLIssue, error) {
	if m.CreateManyFunc != nil {
		return m.CreateManyFunc(ctx, issues)
	}
	panic("CreateManyFunc not implemented")
}

func (m *MockHTMLIssueRepository) GetByCourseID(ctx context.Context, courseID int64) ([]*domain.HTMLIssue, error) {
	if m.GetByCourseFunc != nil {
		return m.GetByCourseFunc(ctx, courseID)
	}
	panic("GetByCourseFunc not implemented")
}

func (m *MockHTMLIssueRepository) GetByID(ctx context.Context, id int64) (*domain.HTMLIssue, error) {
	if m.GetByIDFunc != nil {
		return m.GetByIDFunc(ctx, id)
	}
	panic("GetByIDFunc not implemented")
}

func (m *MockHTMLIssueRepository) Update(ctx context.Context, issue *domain.HTMLIssue) error {
	if m.UpdateFunc != nil {
		return m.UpdateFunc(ctx, issue)
	}
	panic("UpdateFunc not implemented")
}

var _ domain.HTMLIssueRepository = (*MockHTMLIssueRepository)(nil)
