package infrastructure

import (
	"context"
	"database/sql"
	"errors"

	"rewritetest/internal/lti/internal/domain"
)

type MySQLLTIUserLinkRepository struct {
	db *sql.DB
}

func NewMySQLLTIUserLinkRepository(db *sql.DB) *MySQLLTIUserLinkRepository {
	return &MySQLLTIUserLinkRepository{
		db: db,
	}
}

func (r *MySQLLTIUserLinkRepository) GetBySubAndIssuer(ctx context.Context, sub, issuer string) (*domain.LTIUserLink, error) {
	query := `
		SELECT sub, issuer, user_id
		FROM lti_user_link
		WHERE sub = ? AND issuer = ?
	`

	row := r.db.QueryRowContext(ctx, query, sub, issuer)

	var (
		subVal    string
		issuerVal string
		userIDVal int64
	)

	err := row.Scan(&subVal, &issuerVal, &userIDVal)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	link := domain.NewLTIUserLink(subVal, issuerVal, userIDVal)

	return link, nil
}

func (r *MySQLLTIUserLinkRepository) Create(ctx context.Context, link *domain.LTIUserLink) error {
	query := `
		INSERT INTO lti_user_link (sub, issuer, user_id)
		VALUES (?, ?, ?)
	`

	_, err := r.db.ExecContext(ctx, query, link.Sub(), link.Issuer(), link.UserID())
	return err
}
