package infrastructure

import (
	"context"
	"database/sql"

	"rewritetest/internal/lti/internal/domain"
	ltisqlc "rewritetest/internal/lti/internal/infrastructure/sqlc"
)

type MySQLLTICourseLinkRepository struct {
	queries *ltisqlc.Queries
}

func NewMySQLLTICourseLinkRepository(db *sql.DB) *MySQLLTICourseLinkRepository {
	return &MySQLLTICourseLinkRepository{queries: ltisqlc.New(db)}
}

func (r *MySQLLTICourseLinkRepository) Create(ctx context.Context, link domain.LTICourseLink) (domain.LTICourseLink, error) {
	if err := r.queries.CreateLTICourseLink(ctx, ltisqlc.CreateLTICourseLinkParams{
		TenantID: uint64(link.TenantID()), ContextID: link.ContextID(), CourseID: uint64(link.CourseID()),
	}); err != nil {
		return domain.LTICourseLink{}, err
	}
	return r.GetByTenantAndContext(ctx, link.TenantID(), link.ContextID())
}

func (r *MySQLLTICourseLinkRepository) GetByTenantAndContext(ctx context.Context, tenantID int64, contextID string) (domain.LTICourseLink, error) {
	row, err := r.queries.GetLTICourseLinkByTenantAndContext(ctx, ltisqlc.GetLTICourseLinkByTenantAndContextParams{TenantID: uint64(tenantID), ContextID: contextID})
	if err != nil {
		if err == sql.ErrNoRows {
			return domain.LTICourseLink{}, nil
		}
		return domain.LTICourseLink{}, err
	}

	return domain.NewLTICourseLink(int64(row.TenantID), row.ContextID, int64(row.CourseID)), nil
}

var _ domain.LTICourseLinkRepository = (*MySQLLTICourseLinkRepository)(nil)
