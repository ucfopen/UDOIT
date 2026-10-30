package infrastructure

import (
	"context"
	"database/sql"
	"time"

	"rewritetest/internal/accessibility/internal/domain"
	accessibilitysqlc "rewritetest/internal/accessibility/internal/infrastructure/sqlc"
)

type MySQLCourseScanRepository struct {
	queries *accessibilitysqlc.Queries
}

func NewMySQLCourseScanRepository(db *sql.DB) *MySQLCourseScanRepository {
	return &MySQLCourseScanRepository{queries: accessibilitysqlc.New(db)}
}

func (r *MySQLCourseScanRepository) LastCompletedAt(ctx context.Context, courseID int64) (time.Time, error) {
	completedAt, err := r.queries.GetLastCompletedCourseScan(ctx, uint64(courseID))
	if err == sql.ErrNoRows {
		return time.Time{}, nil
	}
	if err != nil {
		return time.Time{}, err
	}
	if !completedAt.Valid {
		return time.Time{}, nil
	}
	return completedAt.Time, nil
}

func (r *MySQLCourseScanRepository) Start(ctx context.Context, scan *domain.CourseScan) error {
	result, err := r.queries.CreateCourseScan(ctx, accessibilitysqlc.CreateCourseScanParams{
		CourseID:  uint64(scan.CourseID),
		ScannedBy: uint64(scan.ScannedBy),
		StartedAt: scan.StartedAt,
	})
	if err != nil {
		return err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	scan.SetID(id)
	return nil
}

func (r *MySQLCourseScanRepository) Complete(ctx context.Context, scan *domain.CourseScan) error {
	if scan.CompletedAt == nil {
		return sql.ErrNoRows
	}

	nullCompletedAt := sql.NullTime{
		Time:  *scan.CompletedAt,
		Valid: true,
	}

	return r.queries.CompleteCourseScan(ctx, accessibilitysqlc.CompleteCourseScanParams{
		CompletedAt: nullCompletedAt,
		ID:          uint64(scan.ID()),
	})
}

var _ domain.CourseScanRepository = (*MySQLCourseScanRepository)(nil)
