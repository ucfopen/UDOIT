package application

import (
	"context"
	"time"

	"rewritetest/internal/lms/internal/domain"
	"rewritetest/internal/shared/apperr"
)

type CreateCourseUseCase struct {
	courseRepository domain.CourseRepository
}

func NewCreateCourseUseCase(courseRepository domain.CourseRepository) *CreateCourseUseCase {
	return &CreateCourseUseCase{courseRepository: courseRepository}
}

type CreateCourseCommand struct {
	Title        string
	TenantID     int64
	ExternalID   string
	ExternalData map[string]any
}

func (u *CreateCourseUseCase) Execute(ctx context.Context, cmd CreateCourseCommand) (*domain.Course, error) {
	course := domain.NewCourse(cmd.Title, cmd.TenantID, true, true, cmd.ExternalID, cmd.ExternalData, time.Now())
	persistedCourse, err := u.courseRepository.Create(ctx, course)
	if err != nil {
		return nil, err
	}
	if persistedCourse == nil {
		return nil, apperr.Internal("Course repository returned no persisted course")
	}
	return persistedCourse, nil
}
