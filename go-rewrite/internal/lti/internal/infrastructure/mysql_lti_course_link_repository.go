package infrastructure

import (
	"context"
	"database/sql"

	"rewritetest/internal/lti/internal/domain"
)

type MySQLLTICourseLinkRepository struct {
	db *sql.DB
}

func NewMySQLLTICourseLinkRepository(db *sql.DB) *MySQLLTICourseLinkRepository {
	return &MySQLLTICourseLinkRepository{
		db: db,
	}
}

func (r *MySQLLTICourseLinkRepository) Create(ctx context.Context, link domain.LTICourseLink) error {
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO lti_course_link (tenant_id, context_id, course_id)
		VALUES (?, ?, ?)
	`, link.TenantID(), link.ContextID(), link.CourseID())
	return err
}

func (r *MySQLLTICourseLinkRepository) GetByTenantAndContext(ctx context.Context, tenantID int64, contextID string) (domain.LTICourseLink, error) {
	row := r.db.QueryRowContext(ctx, `
		SELECT tenant_id, context_id, course_id
		FROM lti_course_link
		WHERE tenant_id = ? AND context_id = ?
	`, tenantID, contextID)

	var tenantIDDB int64
	var ctxID string
	var courseID int64

	err := row.Scan(&tenantIDDB, &ctxID, &courseID)
	if err != nil {
		if err == sql.ErrNoRows {
			return domain.LTICourseLink{}, nil
		}
		return domain.LTICourseLink{}, err
	}

	return domain.NewLTICourseLink(tenantIDDB, ctxID, courseID), nil
}

var _ domain.LTICourseLinkRepository = (*MySQLLTICourseLinkRepository)(nil)
