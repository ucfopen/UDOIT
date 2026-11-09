package infrastructure

import (
	"context"
	"database/sql"

	"rewritetest/internal/accessibility/internal/domain"
	accessibilitysqlc "rewritetest/internal/accessibility/internal/infrastructure/sqlc"
)

type MySQLReportRepository struct {
	queries *accessibilitysqlc.Queries
}

func NewMySQLReportRepository(db *sql.DB) *MySQLReportRepository {
	return &MySQLReportRepository{
		queries: accessibilitysqlc.New(db),
	}
}

func (r *MySQLReportRepository) Create(ctx context.Context, report *domain.Report) (*domain.Report, error) {
	result, err := r.queries.CreateReport(ctx, accessibilitysqlc.CreateReportParams{
		CourseID:        uint64(report.CourseID()),
		ErrorCount:      uint32(report.ErrorCount()),
		SuggestionCount: uint32(report.SuggestionCount()),
		FileCount:       uint32(report.FileCount()),
		ScannedBy:       uint64(report.ScannedBy()),
		ContentFixed:    uint64(report.ContentFixed()),
		ContentResolved: uint64(report.ContentResolved()),
	})
	if err != nil {
		return nil, err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}
	row, err := r.queries.GetReportByID(ctx, uint64(id))
	if err != nil {
		return nil, err
	}
	persisted := domain.RehydratePersistedReport(int64(row.ID), int64(row.CourseID), int(row.ErrorCount), int(row.SuggestionCount), int(row.FileCount), int64(row.ScannedBy), int(row.ContentFixed), int(row.ContentResolved), row.CreatedAt, row.UpdatedAt)
	return persisted, nil
}

var _ domain.ReportRepository = (*MySQLReportRepository)(nil)
