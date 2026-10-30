package infrastructure

import (
	"context"
	"database/sql"
	"encoding/json"

	"rewritetest/internal/lmsdata/internal/domain"
	lmsdatasqlc "rewritetest/internal/lmsdata/internal/infrastructure/sqlc"
)

type MySQLCourseRepository struct {
	queries *lmsdatasqlc.Queries
}

func NewMySQLCourseRepository(db *sql.DB) *MySQLCourseRepository {
	return &MySQLCourseRepository{
		queries: lmsdatasqlc.New(db),
	}
}

func (r *MySQLCourseRepository) Create(ctx context.Context, course *domain.Course) (int64, error) {
	externalDataJSON, err := json.Marshal(course.ExternalData())
	if err != nil {
		return 0, err
	}

	result, err := r.queries.CreateCourse(ctx, lmsdatasqlc.CreateCourseParams{
		Title:        course.Title(),
		IsActive:     course.IsActive(),
		IsDirty:      course.IsDirty(),
		ExternalID:   course.ExternalID(),
		ExternalData: externalDataJSON,
		UpdatedAt:    course.UpdatedAt(),
		TenantID:     uint64(course.TenantID()),
	})
	if err != nil {
		return 0, err
	}

	lastInsertID, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return lastInsertID, nil
}

func (r *MySQLCourseRepository) GetByID(ctx context.Context, courseID int64) (*domain.Course, error) {
	courseRow, err := r.queries.GetCourseByID(ctx, uint64(courseID))
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	var externalData map[string]any
	if err := json.Unmarshal(courseRow.ExternalData, &externalData); err != nil {
		return nil, err
	}

	course := domain.RehydrateCourse(
		int64(courseRow.ID),
		courseRow.Title,
		int64(courseRow.TenantID),
		courseRow.IsActive,
		courseRow.IsDirty,
		courseRow.ExternalID,
		externalData,
		courseRow.UpdatedAt,
	)

	return course, nil
}

var _ domain.CourseRepository = (*MySQLCourseRepository)(nil)
