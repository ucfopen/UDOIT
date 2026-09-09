package application

import (
	"context"
	"time"

	"rewritetest/internal/courses/internal/domain"
)

type CreateCourseUseCase struct {
	courseRepository domain.CourseRepository
}

func NewCreateCourseUseCase(courseRepository domain.CourseRepository) *CreateCourseUseCase {
	return &CreateCourseUseCase{
		courseRepository: courseRepository,
	}
}

type CreateCourseCommand struct {
	Title        string
	TenantID     int64
	ExternalID   string
	ExternalData map[string]any
}

func (u *CreateCourseUseCase) Execute(ctx context.Context, cmd CreateCourseCommand) (int64, error) {
	course := domain.NewCourse(cmd.Title, cmd.TenantID, true, true, cmd.ExternalID, cmd.ExternalData, time.Now())

	courseID, err := u.courseRepository.Create(ctx, course)
	if err != nil {
		return 0, err
	}

	return courseID, nil
}
