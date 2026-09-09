package infrastructure

import (
	"context"
	"database/sql"

	"rewritetest/internal/accessibility/internal/domain"
	accessibilitysqlc "rewritetest/internal/accessibility/internal/infrastructure/sqlc"
)

type MySQLFileIssueRepository struct {
	queries *accessibilitysqlc.Queries
}

func NewMySQLFileIssueRepository(db *sql.DB) *MySQLFileIssueRepository {
	return &MySQLFileIssueRepository{
		queries: accessibilitysqlc.New(db),
	}
}

func (r *MySQLFileIssueRepository) ReplaceForCourse(ctx context.Context, courseID int64, fileIDs []int64) error {
	err := r.queries.DeleteFileIssuesByCourseID(ctx, uint64(courseID))
	if err != nil {
		return err
	}

	for _, fileID := range fileIDs {
		err = r.queries.CreateFileIssue(ctx, uint64(fileID))
		if err != nil {
			return err
		}
	}

	return nil
}

var _ domain.FileIssueRepository = (*MySQLFileIssueRepository)(nil)
