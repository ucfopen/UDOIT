package infrastructure

import (
	"context"

	"rewritetest/internal/accessibility/internal/domain"
)

type MockFileIssueRepository struct {
	SyncForCourseFunc  func(ctx context.Context, courseID int64, fileIDs []int64) error
	DeleteByFileIDFunc func(ctx context.Context, fileID int64) error
	GetByIDFunc        func(ctx context.Context, fileID int64) (*domain.FileIssue, error)
	UpdateFunc         func(ctx context.Context, issue *domain.FileIssue) error
}

func (m *MockFileIssueRepository) SyncForCourse(ctx context.Context, courseID int64, fileIDs []int64) error {
	if m.SyncForCourseFunc != nil {
		return m.SyncForCourseFunc(ctx, courseID, fileIDs)
	}
	panic("SyncForCourseFunc not implemented")
}

func (m *MockFileIssueRepository) DeleteByFileID(ctx context.Context, fileID int64) error {
	if m.DeleteByFileIDFunc != nil {
		return m.DeleteByFileIDFunc(ctx, fileID)
	}
	panic("DeleteByFileIDFunc not implemented")
}

func (m *MockFileIssueRepository) GetByID(ctx context.Context, fileID int64) (*domain.FileIssue, error) {
	if m.GetByIDFunc != nil {
		return m.GetByIDFunc(ctx, fileID)
	}
	panic("GetByIDFunc not implemented")
}

func (m *MockFileIssueRepository) Update(ctx context.Context, issue *domain.FileIssue) error {
	if m.UpdateFunc != nil {
		return m.UpdateFunc(ctx, issue)
	}
	panic("UpdateFunc not implemented")
}

var _ domain.FileIssueRepository = (*MockFileIssueRepository)(nil)
