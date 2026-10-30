package lmsdata

import (
	"database/sql"

	"rewritetest/internal/lmsdata/internal/application"
	"rewritetest/internal/lmsdata/internal/domain"
	"rewritetest/internal/lmsdata/internal/infrastructure"
)

type Module struct {
	contentItemRepository   domain.ContentItemRepository
	createCourseUseCase     *application.CreateCourseUseCase
	courseRepository        domain.CourseRepository
	fileRepository          domain.FileRepository
	fileReferenceRepository domain.FileReferenceRepository
	contentHasher           domain.ContentHasher
	integration             Integration
}

type Integration interface {
	FileReferenceResolver
	CourseContentRetriever
}

func New(db *sql.DB, integration Integration) *Module {
	contentItemRepository := infrastructure.NewMySQLContentItemRepository(db)
	courseRepository := infrastructure.NewMySQLCourseRepository(db)
	fileRepository := infrastructure.NewMySQLFileRepository(db)
	fileReferenceRepository := infrastructure.NewMySQLFileReferenceRepository(db)
	createCourseUseCase := application.NewCreateCourseUseCase(courseRepository)
	contentHasher := infrastructure.NewBlake3ContentHasher()

	return &Module{
		contentItemRepository:   contentItemRepository,
		createCourseUseCase:     createCourseUseCase,
		courseRepository:        courseRepository,
		fileRepository:          fileRepository,
		fileReferenceRepository: fileReferenceRepository,
		contentHasher:           contentHasher,
		integration:             integration,
	}
}
