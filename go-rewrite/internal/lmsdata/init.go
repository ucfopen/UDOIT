package lmsdata

import (
	"context"
	"database/sql"

	"rewritetest/internal/lms"
	"rewritetest/internal/lmsdata/internal/domain"
	"rewritetest/internal/lmsdata/internal/infrastructure"
)

type Module struct {
	fileReferenceRepository domain.FileReferenceRepository
	contentHasher           domain.ContentHasher
	integration             Integration
}

type Integration interface {
	FileReferenceResolver
	CourseContentRetriever
	CourseRetriever
	ContentItemRepository
	FileDataRepository
}

type FileDataRepository interface {
	SyncFilesForCourse(context.Context, int64, []lms.FileSyncInput) error
	GetFilesByCourse(context.Context, int64) ([]lms.File, error)
	GetFile(context.Context, int64) (lms.File, error)
	UpdateFile(context.Context, lms.File) error
}

type ContentItemRepository interface {
	GetContentItemsByCourse(context.Context, int64) ([]lms.ContentItem, error)
	CreateManyContentItems(context.Context, []lms.ContentItem) ([]lms.ContentItem, error)
}

type CourseRetriever interface {
	GetCourse(context.Context, int64) (lms.Course, error)
}

func New(db *sql.DB, integration Integration) *Module {
	fileReferenceRepository := infrastructure.NewMySQLFileReferenceRepository(db)
	contentHasher := infrastructure.NewBlake3ContentHasher()

	return &Module{
		fileReferenceRepository: fileReferenceRepository,
		contentHasher:           contentHasher,
		integration:             integration,
	}
}
