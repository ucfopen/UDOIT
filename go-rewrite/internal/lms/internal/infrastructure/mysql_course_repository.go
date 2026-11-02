package infrastructure

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"

	"rewritetest/internal/lms/internal/domain"
	lmssqlc "rewritetest/internal/lms/internal/infrastructure/sqlc"
)

type MySQLCourseRepository struct {
	queries *lmssqlc.Queries
}

func NewMySQLCourseRepository(db *sql.DB) *MySQLCourseRepository {
	return &MySQLCourseRepository{queries: lmssqlc.New(db)}
}

func (r *MySQLCourseRepository) Create(ctx context.Context, course *domain.Course) (*domain.Course, error) {
	externalDataJSON, err := json.Marshal(course.ExternalData())
	if err != nil {
		return nil, err
	}
	result, err := r.queries.CreateCourse(ctx, lmssqlc.CreateCourseParams{
		Title:        course.Title(),
		IsActive:     course.IsActive(),
		IsDirty:      course.IsDirty(),
		ExternalID:   course.ExternalID(),
		ExternalData: externalDataJSON,
		UpdatedAt:    course.UpdatedAt(),
		TenantID:     uint64(course.TenantID()),
	})
	if err != nil {
		return nil, err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}
	return r.getByID(ctx, id)
}

func (r *MySQLCourseRepository) GetByID(ctx context.Context, courseID int64) (*domain.Course, error) {
	return r.getByID(ctx, courseID)
}

func (r *MySQLCourseRepository) getByID(ctx context.Context, courseID int64) (*domain.Course, error) {
	row, err := r.queries.GetCourseByID(ctx, uint64(courseID))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	var externalData map[string]any
	if err := json.Unmarshal(row.ExternalData, &externalData); err != nil {
		return nil, err
	}
	return domain.RehydrateCourse(int64(row.ID), row.Title, int64(row.TenantID), row.IsActive, row.IsDirty, row.ExternalID, externalData, row.UpdatedAt), nil
}

var _ domain.CourseRepository = (*MySQLCourseRepository)(nil)
