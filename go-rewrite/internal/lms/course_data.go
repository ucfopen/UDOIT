package lms

import (
	"context"

	"rewritetest/internal/lms/internal/application"
	"rewritetest/internal/shared/apperr"
)

// Course is the persisted LMS course record used by application modules.
type Course struct {
	ID           int64
	TenantID     int64
	ExternalID   string
	ExternalData map[string]any
}

func (m *Module) CreateCourse(ctx context.Context, title string, tenantID int64, externalID string, externalData map[string]any) (int64, error) {
	course, err := m.createCourseUseCase.Execute(ctx, application.CreateCourseCommand{
		Title: title, TenantID: tenantID, ExternalID: externalID, ExternalData: externalData,
	})
	if err != nil {
		return 0, err
	}
	return course.ID(), nil
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
		ID: course.ID(), TenantID: course.TenantID(), ExternalID: course.ExternalID(), ExternalData: course.ExternalData(),
	}, nil
}
