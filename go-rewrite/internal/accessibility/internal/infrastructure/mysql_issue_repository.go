package infrastructure

import (
	"context"
	"database/sql"
	"encoding/json"
	"time"

	"rewritetest/internal/accessibility/internal/domain"
	accessibilitysqlc "rewritetest/internal/accessibility/internal/infrastructure/sqlc"
)

type MySQLIssueRepository struct {
	db      *sql.DB
	queries *accessibilitysqlc.Queries
}

func NewMySQLIssueRepository(db *sql.DB) *MySQLIssueRepository {
	return &MySQLIssueRepository{
		db:      db,
		queries: accessibilitysqlc.New(db),
	}
}

func (r *MySQLIssueRepository) DeleteByContentItemIDs(ctx context.Context, contentItemIDs []int64) error {
	if len(contentItemIDs) == 0 {
		return nil
	}

	placeholders := make([]string, len(contentItemIDs))
	args := make([]any, len(contentItemIDs))
	for i, id := range contentItemIDs {
		placeholders[i] = "?"
		args[i] = id
	}

	uintContentItemIDs := make([]uint64, len(contentItemIDs))
	for i, id := range contentItemIDs {
		uintContentItemIDs[i] = uint64(id)
	}

	return r.queries.DeleteHTMLIssuesByContentItemIDs(ctx, uintContentItemIDs)
}

func (r *MySQLIssueRepository) CreateMany(ctx context.Context, issues []*domain.HTMLIssue) ([]*domain.HTMLIssue, error) {
	if len(issues) == 0 {
		return []*domain.HTMLIssue{}, nil
	}
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	qtx := r.queries.WithTx(tx)
	persisted := make([]*domain.HTMLIssue, 0, len(issues))

	for _, issue := range issues {
		var nullableFixedby sql.NullInt64
		if issue.FixedBy() != 0 {
			nullableFixedby = sql.NullInt64{
				Int64: issue.FixedBy(),
				Valid: true,
			}
		} else {
			nullableFixedby = sql.NullInt64{Valid: false}
		}

		detailsJSON, err := json.Marshal(issue.Details())
		if err != nil {
			return nil, err
		}

		result, err := qtx.CreateIssue(ctx, accessibilitysqlc.CreateIssueParams{
			ContentItemID: uint64(issue.ContentItemID()),
			ScanRule:      issue.ScanRule().String(),
			ContentXpath:  issue.ContentXPath(),
			Status:        issue.Status().String(),
			Severity:      issue.Severity().String(),
			FixedBy:       nullableFixedby,
			FixedAt:       nullTime(issue.FixedAt()),
			Details:       detailsJSON,
		})
		if err != nil {
			return nil, err
		}
		id, err := result.LastInsertId()
		if err != nil {
			return nil, err
		}
		row, err := qtx.GetHTMLIssueByID(ctx, uint64(id))
		if err != nil {
			return nil, err
		}
		details := map[string]any{}
		if err := json.Unmarshal(row.Details, &details); err != nil {
			return nil, err
		}
		scanRule, err := domain.ParseScanRule(row.ScanRule)
		if err != nil {
			return nil, err
		}
		status, err := domain.ParseIssueStatus(row.Status)
		if err != nil {
			return nil, err
		}
		severity, err := domain.ParseIssueSeverity(row.Severity)
		if err != nil {
			return nil, err
		}
		persisted = append(persisted, domain.RehydrateHTMLIssue(int64(row.ID), int64(row.ContentItemID), scanRule, row.ContentXpath, status, severity, row.FixedBy.Int64, row.FixedAt.Time, details, row.CreatedAt, row.UpdatedAt))
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return persisted, nil
}

func (r *MySQLIssueRepository) GetByCourseID(ctx context.Context, courseID int64) ([]*domain.HTMLIssue, error) {
	issues, err := r.queries.GetHTMLIssuesByCourseID(ctx, uint64(courseID))
	if err != nil {
		return nil, err
	}

	var domainHTMLIssues []*domain.HTMLIssue
	for _, issue := range issues {
		scanRule, err := domain.ParseScanRule(issue.ScanRule)
		if err != nil {
			return nil, err
		}

		issueStatus, err := domain.ParseIssueStatus(issue.Status)
		if err != nil {
			return nil, err
		}

		issueSeverity, err := domain.ParseIssueSeverity(issue.Severity)
		if err != nil {
			return nil, err
		}

		var detailsMap map[string]any
		if err := json.Unmarshal(issue.Details, &detailsMap); err != nil {
			return nil, err
		}

		domainHTMLIssues = append(domainHTMLIssues, domain.RehydrateHTMLIssue(
			int64(issue.ID),
			int64(issue.ContentItemID),
			scanRule,
			issue.ContentXpath,
			issueStatus,
			issueSeverity,
			int64(issue.FixedBy.Int64),
			issue.FixedAt.Time,
			detailsMap,
			issue.CreatedAt,
			issue.UpdatedAt,
		))
	}

	return domainHTMLIssues, nil
}

func (r *MySQLIssueRepository) GetByID(ctx context.Context, id int64) (*domain.HTMLIssue, error) {
	issue, err := r.queries.GetHTMLIssueByID(ctx, uint64(id))
	if err != nil {
		return nil, err
	}

	scanRule, err := domain.ParseScanRule(issue.ScanRule)
	if err != nil {
		return nil, err
	}

	issueStatus, err := domain.ParseIssueStatus(issue.Status)
	if err != nil {
		return nil, err
	}

	issueSeverity, err := domain.ParseIssueSeverity(issue.Severity)
	if err != nil {
		return nil, err
	}

	var detailsMap map[string]any
	if err := json.Unmarshal(issue.Details, &detailsMap); err != nil {
		return nil, err
	}

	return domain.RehydrateHTMLIssue(
		int64(issue.ID),
		int64(issue.ContentItemID),
		scanRule,
		issue.ContentXpath,
		issueStatus,
		issueSeverity,
		int64(issue.FixedBy.Int64),
		issue.FixedAt.Time,
		detailsMap,
		issue.CreatedAt,
		issue.UpdatedAt,
	), nil
}

func (r *MySQLIssueRepository) Update(ctx context.Context, issue *domain.HTMLIssue) error {
	return r.queries.UpdateHTMLIssue(
		ctx,
		accessibilitysqlc.UpdateHTMLIssueParams{
			ID:        uint64(issue.ID()),
			Status:    issue.Status().String(),
			FixedAt:   sql.NullTime{Time: issue.FixedAt(), Valid: !issue.FixedAt().IsZero()},
			FixedBy:   sql.NullInt64{Int64: issue.FixedBy(), Valid: true},
			UpdatedAt: issue.UpdatedAt(),
		},
	)
}

func nullTime(t time.Time) sql.NullTime {
	if !t.IsZero() {
		return sql.NullTime{
			Time:  t,
			Valid: true,
		}
	}
	return sql.NullTime{Valid: false}
}

var _ domain.HTMLIssueRepository = (*MySQLIssueRepository)(nil)
