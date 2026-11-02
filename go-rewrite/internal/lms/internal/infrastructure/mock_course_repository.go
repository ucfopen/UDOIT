package infrastructure

import (
	"context"

	"rewritetest/internal/lms/internal/domain"
)

type MockCourseRepository struct {
	CreateFunc  func(ctx context.Context, course *domain.Course) (*domain.Course, error)
	GetByIDFunc func(ctx context.Context, courseID int64) (*domain.Course, error)
}

func (m *MockCourseRepository) Create(ctx context.Context, course *domain.Course) (*domain.Course, error) {
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

func NewMapMockCourseRepository() *MockCourseRepository {
	courses := map[int64]*domain.Course{}
	var nextID int64 = 1
	return &MockCourseRepository{
		CreateFunc: func(_ context.Context, course *domain.Course) (*domain.Course, error) {
			id := nextID
			nextID++
			courses[id] = domain.RehydrateCourse(id, course.Title(), course.TenantID(), course.IsActive(), course.IsDirty(), course.ExternalID(), course.ExternalData(), course.UpdatedAt())
			return courses[id], nil
		},
		GetByIDFunc: func(_ context.Context, courseID int64) (*domain.Course, error) {
			return courses[courseID], nil
		},
	}
}
