package infrastructure

import (
	"context"
	"database/sql"
	"time"

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

func (r *MySQLFileIssueRepository) GetByID(ctx context.Context, ID int64) (*domain.FileIssue, error) {
	issue, err := r.queries.GetFileIssueByID(ctx, uint64(ID))
	if err != nil {
		return nil, err
	}

	var reviewerID *int64
	var reviewedOn *time.Time

	if issue.ReviewerID.Valid {
		reviewerID = &issue.ReviewerID.Int64
	}
	if issue.ReviewedOn.Valid {
		reviewedOn = &issue.ReviewedOn.Time
	}

	rehydratedFileIssue, err := domain.RehydrateFileIssue(
		int64(issue.ID),
		int64(issue.FileID),
		reviewerID,
		reviewedOn,
		issue.CreatedAt,
		issue.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return rehydratedFileIssue, nil
}

func (r *MySQLFileIssueRepository) Update(ctx context.Context, issue *domain.FileIssue) error {
	reviewerID, err := issue.ReviewerID()
	if err != nil {
		return err
	}
	reviewedOn, err := issue.ReviewedOn()
	if err != nil {
		return err
	}
	return r.queries.MarkFileReviewed(
		ctx,
		accessibilitysqlc.MarkFileReviewedParams{
			ID:         uint64(issue.ID()),
			ReviewerID: sql.NullInt64{Int64: reviewerID, Valid: true},
			ReviewedOn: sql.NullTime{Time: reviewedOn, Valid: true},
			UpdatedAt:  issue.UpdatedAt(),
		},
	)
}

var _ domain.FileIssueRepository = (*MySQLFileIssueRepository)(nil)
