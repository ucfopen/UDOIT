package mysql

import (
	"context"
	"database/sql"
	"encoding/json"

	"rewritetest/internal/lms/internal/record"
	lmssqlc "rewritetest/internal/lms/internal/storage/mysql/sqlc"
)

func (r *Store) CreateCourse(ctx context.Context, course record.Course) (record.Course, error) {
	externalDataJSON, err := json.Marshal(course.ExternalData)
	if err != nil {
		return record.Course{}, err
	}
	result, err := r.queries.CreateCourse(ctx, lmssqlc.CreateCourseParams{
		Title:        course.Title,
		IsActive:     course.IsActive,
		IsDirty:      course.IsDirty,
		ExternalID:   course.ExternalID,
		ExternalData: externalDataJSON,
		UpdatedAt:    course.UpdatedAt,
		TenantID:     uint64(course.TenantID),
	})
	if err != nil {
		return record.Course{}, err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return record.Course{}, err
	}
	return r.getByID(ctx, id)
}

func (r *Store) CourseByID(ctx context.Context, courseID int64) (record.Course, bool, error) {
	course, err := r.getByID(ctx, courseID)
	if err == sql.ErrNoRows {
		return record.Course{}, false, nil
	}
	return course, err == nil, err
}

func (r *Store) getByID(ctx context.Context, courseID int64) (record.Course, error) {
	row, err := r.queries.GetCourseByID(ctx, uint64(courseID))
	if err != nil {
		return record.Course{}, err
	}
	var externalData map[string]any
	if err := json.Unmarshal(row.ExternalData, &externalData); err != nil {
		return record.Course{}, err
	}
	return record.Course{ID: int64(row.ID), Title: row.Title, TenantID: int64(row.TenantID), IsActive: row.IsActive, IsDirty: row.IsDirty, ExternalID: row.ExternalID, ExternalData: externalData, UpdatedAt: row.UpdatedAt}, nil
}
