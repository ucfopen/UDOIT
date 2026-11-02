package lmsdata

import (
	"context"
	"database/sql"

	"rewritetest/internal/lms"
	"rewritetest/internal/lmsdata/internal/domain"
	"rewritetest/internal/lmsdata/internal/infrastructure"
)

type Module struct {
	contentItemRepository   domain.ContentItemRepository
	fileRepository          domain.FileRepository
	fileReferenceRepository domain.FileReferenceRepository
	contentHasher           domain.ContentHasher
	integration             Integration
}

type Integration interface {
	FileReferenceResolver
	CourseContentRetriever
	CourseRetriever
}

type CourseRetriever interface {
	GetCourse(context.Context, int64) (lms.Course, error)
}

func New(db *sql.DB, integration Integration) *Module {
	contentItemRepository := infrastructure.NewMySQLContentItemRepository(db)
	fileRepository := infrastructure.NewMySQLFileRepository(db)
	fileReferenceRepository := infrastructure.NewMySQLFileReferenceRepository(db)
	contentHasher := infrastructure.NewBlake3ContentHasher()

	return &Module{
		contentItemRepository:   contentItemRepository,
		fileRepository:          fileRepository,
		fileReferenceRepository: fileReferenceRepository,
		contentHasher:           contentHasher,
		integration:             integration,
	}
}
