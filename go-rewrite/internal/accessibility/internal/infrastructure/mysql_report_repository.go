package infrastructure

import (
	"context"
	"database/sql"

	"rewritetest/internal/accessibility/internal/domain"
)

type MySQLReportRepository struct {
	db *sql.DB
}

func NewMySQLReportRepository(db *sql.DB) *MySQLReportRepository {
	return &MySQLReportRepository{
		db: db,
	}
}

func (r *MySQLReportRepository) Create(ctx context.Context, report *domain.Report) error {
	_, err := r.db.ExecContext(
		ctx,
		`INSERT INTO report (id, course_id, error_count, suggestion_count, file_count, scanned_by, content_fixed, content_resolved)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		report.ID(),
		report.CourseID(),
		report.ErrorCount(),
		report.SuggestionCount(),
		report.FileCount(),
		report.ScannedBy(),
		report.ContentFixed(),
		report.ContentResolved(),
	)
	return err
}

var _ domain.ReportRepository = (*MySQLReportRepository)(nil)
