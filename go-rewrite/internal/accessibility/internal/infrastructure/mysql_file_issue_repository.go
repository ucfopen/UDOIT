package infrastructure

import (
	"context"
	"database/sql"
	"time"

	"rewritetest/internal/accessibility/internal/domain"
	accessibilitysqlc "rewritetest/internal/accessibility/internal/infrastructure/sqlc"
)

type MySQLFileIssueRepository struct {
	db      *sql.DB
	queries *accessibilitysqlc.Queries
}

func NewMySQLFileIssueRepository(db *sql.DB) *MySQLFileIssueRepository {
	return &MySQLFileIssueRepository{
		db:      db,
		queries: accessibilitysqlc.New(db),
	}
}

func (r *MySQLFileIssueRepository) SyncForCourse(ctx context.Context, courseID int64, fileIDs []int64) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	queries := r.queries.WithTx(tx)
	existingFileIDs, err := queries.GetFileIssueFileIDsByCourseID(ctx, uint64(courseID))
	if err != nil {
		return err
	}

	currentFileIDs := make(map[int64]struct{}, len(fileIDs))
	for _, fileID := range fileIDs {
		currentFileIDs[fileID] = struct{}{}
		if err := queries.UpsertFileIssueForCourseFile(ctx, accessibilitysqlc.UpsertFileIssueForCourseFileParams{
			FileID:   uint64(fileID),
			CourseID: uint64(courseID),
		}); err != nil {
			return err
		}
	}
	for _, fileID := range existingFileIDs {
		if _, stillInCourse := currentFileIDs[int64(fileID)]; stillInCourse {
			continue
		}
		if err := queries.DeleteFileIssueByFileID(ctx, fileID); err != nil {
			return err
		}
	}
	if err := queries.DeleteReplacementFileIssuesByCourseID(ctx, uint64(courseID)); err != nil {
		return err
	}
	return tx.Commit()
}

func (r *MySQLFileIssueRepository) DeleteByFileID(ctx context.Context, fileID int64) error {
	return r.queries.DeleteFileIssueByFileID(ctx, uint64(fileID))
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
