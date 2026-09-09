package infrastructure

import (
	"context"

	"rewritetest/internal/files/internal/domain"
)

type MockFileRepository struct {
	GetFileByIDFunc    func(ctx context.Context, id int64) (*domain.File, error)
	GetByCourseIDFunc  func(ctx context.Context, courseID int64) ([]*domain.File, error)
	UpdateFileFunc     func(ctx context.Context, file *domain.File) error
	DeleteFileFunc     func(ctx context.Context, id int64) error
	UpsertByCourseFunc func(ctx context.Context, courseID int64, records []domain.CourseFileSyncRecord) error
	SeedFilesFunc      func(seed ...*domain.File)
}

var _ domain.FileRepository = (*MockFileRepository)(nil)

func (m *MockFileRepository) GetFileByID(ctx context.Context, id int64) (*domain.File, error) {
	if m.GetFileByIDFunc != nil {
		return m.GetFileByIDFunc(ctx, id)
	}

	panic("GetFileByIDFunc is not defined")
}

func (m *MockFileRepository) GetByCourseID(ctx context.Context, courseID int64) ([]*domain.File, error) {
	if m.GetByCourseIDFunc != nil {
		return m.GetByCourseIDFunc(ctx, courseID)
	}

	panic("GetByCourseIDFunc is not defined")
}

func (m *MockFileRepository) UpdateFile(ctx context.Context, file *domain.File) error {
	if m.UpdateFileFunc != nil {
		return m.UpdateFileFunc(ctx, file)
	}

	panic("UpdateFileFunc is not defined")
}

func (m *MockFileRepository) DeleteFile(ctx context.Context, id int64) error {
	if m.DeleteFileFunc != nil {
		return m.DeleteFileFunc(ctx, id)
	}
	panic("DeleteFileFunc is not defined")
}

func (m *MockFileRepository) UpsertByCourse(ctx context.Context, courseID int64, records []domain.CourseFileSyncRecord) error {
	if m.UpsertByCourseFunc != nil {
		return m.UpsertByCourseFunc(ctx, courseID, records)
	}

	panic("UpsertByCourseFunc is not defined")
}

func (m *MockFileRepository) SeedFiles(seed ...*domain.File) {
	if seed == nil {
		return
	}
	if m.SeedFilesFunc != nil {
		m.SeedFilesFunc(seed...)
	}
}

// Helper implementations

func NewArrayMockFileRepository() *MockFileRepository {
	files := []*domain.File{}

	return &MockFileRepository{
		GetFileByIDFunc: func(ctx context.Context, id int64) (*domain.File, error) {
			for _, f := range files {
				if f.ID() == id {
					return f, nil
				}
			}
			return nil, nil
		},
		GetByCourseIDFunc: func(ctx context.Context, courseID int64) ([]*domain.File, error) {
			var matches []*domain.File
			for _, f := range files {
				if f.CourseID() == courseID {
					matches = append(matches, f)
				}
			}
			return matches, nil
		},
		UpdateFileFunc: func(ctx context.Context, file *domain.File) error {
			for i, f := range files {
				if f.ID() == file.ID() {
					files[i] = file
					return nil
				}
			}
			return nil
		},
		DeleteFileFunc: func(ctx context.Context, id int64) error {
			for i, f := range files {
				if f.ID() == id {
					files = append(files[:i], files[i+1:]...)
					return nil
				}
			}
			return nil
		},
		UpsertByCourseFunc: func(ctx context.Context, courseID int64, records []domain.CourseFileSyncRecord) error {
			_ = courseID
			_ = records
			return nil
		},
		SeedFilesFunc: func(seed ...*domain.File) {
			files = append(files, seed...)
		},
	}
}
