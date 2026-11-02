package lmsdata

import (
	"context"

	"rewritetest/internal/lms"
	"rewritetest/internal/lmsdata/internal/domain"
	"rewritetest/internal/lmsdata/internal/infrastructure"
)

type Module struct {
	contentHasher domain.ContentHasher
	integration   Integration
}

type Integration interface {
	CourseContentRetriever
	CourseRetriever
	ContentItemRepository
	FileSynchronizer
}

type FileSynchronizer interface {
	SyncFilesForCourse(context.Context, int64, []lms.FileSyncInput) error
	GetFilesByCourse(context.Context, int64) ([]lms.File, error)
}

type ContentItemRepository interface {
	GetContentItemsByCourse(context.Context, int64) ([]lms.ContentItem, error)
	CreateManyContentItems(context.Context, []lms.ContentItem) ([]lms.ContentItem, error)
}

type CourseRetriever interface {
	GetCourse(context.Context, int64) (lms.Course, error)
}

func New(integration Integration) *Module {
	contentHasher := infrastructure.NewBlake3ContentHasher()

	return &Module{
		contentHasher: contentHasher,
		integration:   integration,
	}
}
