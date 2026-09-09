package application

import (
	"context"
	"errors"
	"testing"

	"rewritetest/internal/courses/internal/domain"
	"rewritetest/internal/courses/internal/infrastructure"

	"github.com/stretchr/testify/require"
)

func TestCreateCourse_Success(t *testing.T) {
	repo := &infrastructure.MockCourseRepository{
		CreateFunc: func(_ context.Context, course *domain.Course) (int64, error) {
			require.Equal(t, "Biology 101", course.Title())
			require.Equal(t, int64(12), course.TenantID())
			require.True(t, course.IsActive())
			require.True(t, course.IsDirty())
			require.Equal(t, "ext-course-1", course.ExternalID())
			require.Equal(t, map[string]any{"lms": "canvas"}, course.ExternalData())
			return 42, nil
		},
	}

	uc := NewCreateCourseUseCase(repo)
	courseID, err := uc.Execute(context.Background(), CreateCourseCommand{
		Title:        "Biology 101",
		TenantID:     12,
		ExternalID:   "ext-course-1",
		ExternalData: map[string]any{"lms": "canvas"},
	})

	require.NoError(t, err)
	require.Equal(t, int64(42), courseID)
}

func TestCreateCourse_RepositoryErrorIsReturned(t *testing.T) {
	expectedErr := errors.New("insert failed")
	repo := &infrastructure.MockCourseRepository{
		CreateFunc: func(_ context.Context, _ *domain.Course) (int64, error) {
			return 0, expectedErr
		},
	}

	uc := NewCreateCourseUseCase(repo)
	_, err := uc.Execute(context.Background(), CreateCourseCommand{Title: "Biology 101", TenantID: 12})

	require.ErrorIs(t, err, expectedErr)
}
