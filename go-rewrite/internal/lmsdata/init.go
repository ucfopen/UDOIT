package lmsdata

import (
	"context"
	"database/sql"

	"rewritetest/internal/lms"
	"rewritetest/internal/lmsdata/internal/domain"
	"rewritetest/internal/lmsdata/internal/infrastructure"
)

type Module struct {
	fileRepository          domain.FileRepository
	fileReferenceRepository domain.FileReferenceRepository
	contentHasher           domain.ContentHasher
	integration             Integration
}

type Integration interface {
	FileReferenceResolver
	CourseContentRetriever
	CourseRetriever
	ContentItemRepository
}

type ContentItemRepository interface {
	GetContentItemsByCourse(context.Context, int64) ([]lms.ContentItem, error)
	CreateManyContentItems(context.Context, []lms.ContentItem) ([]lms.ContentItem, error)
}

type CourseRetriever interface {
	GetCourse(context.Context, int64) (lms.Course, error)
}

func New(db *sql.DB, integration Integration) *Module {
	fileRepository := infrastructure.NewMySQLFileRepository(db)
	fileReferenceRepository := infrastructure.NewMySQLFileReferenceRepository(db)
	contentHasher := infrastructure.NewBlake3ContentHasher()

	return &Module{
		fileRepository:          fileRepository,
		fileReferenceRepository: fileReferenceRepository,
		contentHasher:           contentHasher,
		integration:             integration,
	}
}
