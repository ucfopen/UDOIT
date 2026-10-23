package lmsdata

import (
	"database/sql"

	contentdomain "rewritetest/internal/lmsdata/internal/content/domain"
	contentinfrastructure "rewritetest/internal/lmsdata/internal/content/infrastructure"
	coursesapplication "rewritetest/internal/lmsdata/internal/courses/application"
	coursesdomain "rewritetest/internal/lmsdata/internal/courses/domain"
	coursesinfrastructure "rewritetest/internal/lmsdata/internal/courses/infrastructure"
	lmsdatadomain "rewritetest/internal/lmsdata/internal/domain"
	fileReferencesDomain "rewritetest/internal/lmsdata/internal/file_references/domain"
	fileReferencesInfrastructure "rewritetest/internal/lmsdata/internal/file_references/infrastructure"
	filesdomain "rewritetest/internal/lmsdata/internal/files/domain"
	filesinfrastructure "rewritetest/internal/lmsdata/internal/files/infrastructure"
	lmsdatainfrastructure "rewritetest/internal/lmsdata/internal/infrastructure"
)

type Module struct {
	contentItemRepository   contentdomain.ContentItemRepository
	createCourseUseCase     *coursesapplication.CreateCourseUseCase
	courseRepository        coursesdomain.CourseRepository
	fileRepository          filesdomain.FileRepository
	fileReferenceRepository fileReferencesDomain.FileReferenceRepository
	contentHasher           lmsdatadomain.ContentHasher
	integration             Integration
}

type Integration interface {
	FileReferenceResolver
	CourseContentRetriever
}

func New(db *sql.DB, integration Integration) *Module {
	contentItemRepository := contentinfrastructure.NewMySQLContentItemRepository(db)
	courseRepository := coursesinfrastructure.NewMySQLCourseRepository(db)
	fileRepository := filesinfrastructure.NewMySQLFileRepository(db)
	fileReferenceRepository := fileReferencesInfrastructure.NewMySQLFileReferenceRepository(db)
	createCourseUseCase := coursesapplication.NewCreateCourseUseCase(courseRepository)
	contentHasher := lmsdatainfrastructure.NewBlake3ContentHasher()

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
