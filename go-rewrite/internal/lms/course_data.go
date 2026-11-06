package lms

import (
	"context"
	"time"

	"rewritetest/internal/lms/internal/record"
	"rewritetest/internal/shared/apperr"
)

// Course is the persisted LMS course record used by application modules.
type Course struct {
	ID           int64
	TenantID     int64
	ExternalID   string
	ExternalData map[string]any
}

func (m *Service) CreateCourse(ctx context.Context, title string, tenantID int64, externalID string, externalData map[string]any) (int64, error) {
	course, err := m.store.CreateCourse(ctx, record.Course{Title: title, TenantID: tenantID, ExternalID: externalID, ExternalData: externalData, IsActive: true, IsDirty: true, UpdatedAt: time.Now()})
	if err != nil {
		return 0, err
	}
	return course.ID, nil
}

func (m *Service) GetCourse(ctx context.Context, courseID int64) (Course, error) {
	course, found, err := m.store.CourseByID(ctx, courseID)
	if err != nil {
		return Course{}, err
	}
	if !found {
		return Course{}, apperr.New(apperr.CodeInternal, "The requested course was not found.")
	}
	return Course{
		ID: course.ID, TenantID: course.TenantID, ExternalID: course.ExternalID, ExternalData: course.ExternalData,
	}, nil
}
