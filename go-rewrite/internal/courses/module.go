package courses

import (
	"context"
	"database/sql"

	"rewritetest/internal/courses/internal/application"
	"rewritetest/internal/courses/internal/domain"
	"rewritetest/internal/courses/internal/infrastructure"
	"rewritetest/internal/shared/apperr"
)

type Module struct {
	createCourseUseCase *application.CreateCourseUseCase
	courseRepository    domain.CourseRepository
}

func New(db *sql.DB) *Module {
	courseRepository := infrastructure.NewMySQLCourseRepository(db)
	createCourseUseCase := application.NewCreateCourseUseCase(courseRepository)

	return &Module{
		createCourseUseCase: createCourseUseCase,
		courseRepository:    courseRepository,
	}
}

func (m *Module) CreateCourse(ctx context.Context, title string, tenantID int64, externalID string, externalData map[string]any) (int64, error) {
	return m.createCourseUseCase.Execute(ctx, application.CreateCourseCommand{
		Title:        title,
		TenantID:     tenantID,
		ExternalID:   externalID,
		ExternalData: externalData,
	})
}

type Course struct {
	ID           int64
	ExternalID   string
	ExternalData map[string]any
}

func (m *Module) GetCourse(ctx context.Context, courseID int64) (Course, error) {
	course, err := m.courseRepository.GetByID(ctx, courseID)
	if err != nil {
		return Course{}, err
	}
	if course == nil {
		return Course{}, apperr.New(apperr.CodeInternal, "The requested course was not found.")
	}

	return Course{
		ID:           course.ID(),
		ExternalID:   course.ExternalID(),
		ExternalData: course.ExternalData(),
	}, nil
}
