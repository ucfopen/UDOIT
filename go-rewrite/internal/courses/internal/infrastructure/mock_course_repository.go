package infrastructure

import (
	"context"

	"rewritetest/internal/courses/internal/domain"
)

type MockCourseRepository struct {
	CreateFunc  func(ctx context.Context, course *domain.Course) (int64, error)
	GetByIDFunc func(ctx context.Context, courseID int64) (*domain.Course, error)
}

func (m *MockCourseRepository) Create(ctx context.Context, course *domain.Course) (int64, error) {
	if m.CreateFunc != nil {
		return m.CreateFunc(ctx, course)
	}

	panic("CreateFunc not implemented")
}

func (m *MockCourseRepository) GetByID(ctx context.Context, courseID int64) (*domain.Course, error) {
	if m.GetByIDFunc != nil {
		return m.GetByIDFunc(ctx, courseID)
	}

	panic("GetByIDFunc not implemented")
}

var _ domain.CourseRepository = (*MockCourseRepository)(nil)

// Helper implementations

func NewMapMockCourseRepository() *MockCourseRepository {
	courses := map[int64]*domain.Course{}
	var nextID int64 = 1

	return &MockCourseRepository{
		CreateFunc: func(_ context.Context, course *domain.Course) (int64, error) {
			id := nextID
			nextID++
			courses[id] = domain.RehydrateCourse(
				id,
				course.Title(),
				course.TenantID(),
				course.IsActive(),
				course.IsDirty(),
				course.ExternalID(),
				course.ExternalData(),
				course.UpdatedAt(),
			)
			return id, nil
		},
		GetByIDFunc: func(_ context.Context, courseID int64) (*domain.Course, error) {
			course, ok := courses[courseID]
			if !ok {
				return nil, nil
			}
			return course, nil
		},
	}
}
