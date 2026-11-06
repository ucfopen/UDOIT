package lms

import (
	"context"
	"time"

	"rewritetest/internal/lms/internal/record"
	"rewritetest/internal/shared/apperr"
)

func (s *Service) createCourse(ctx context.Context, title string, tenantID int64, externalID string, externalData map[string]any) (record.Course, error) {
	course := record.Course{Title: title, TenantID: tenantID, IsActive: true, IsDirty: true, ExternalID: externalID, ExternalData: externalData, UpdatedAt: time.Now()}
	persistedCourse, err := s.store.CreateCourse(ctx, course)
	if err != nil {
		return record.Course{}, err
	}
	if persistedCourse.ID == 0 {
		return record.Course{}, apperr.Internal("Course store returned no persisted course")
	}
	return persistedCourse, nil
}
