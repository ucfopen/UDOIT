package infrastructure

import (
	"context"
	"database/sql"
	"errors"

	"rewritetest/internal/lti/internal/domain"
	ltisqlc "rewritetest/internal/lti/internal/infrastructure/sqlc"
)

type MySQLLTIUserLinkRepository struct {
	queries *ltisqlc.Queries
}

func NewMySQLLTIUserLinkRepository(db *sql.DB) *MySQLLTIUserLinkRepository {
	return &MySQLLTIUserLinkRepository{queries: ltisqlc.New(db)}
}

func (r *MySQLLTIUserLinkRepository) GetBySubAndIssuer(ctx context.Context, sub, issuer string) (*domain.LTIUserLink, error) {
	row, err := r.queries.GetLTIUserLinkBySubAndIssuer(ctx, ltisqlc.GetLTIUserLinkBySubAndIssuerParams{Sub: sub, Issuer: issuer})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	link := domain.NewLTIUserLink(row.Sub, row.Issuer, int64(row.UserID))

	return link, nil
}

func (r *MySQLLTIUserLinkRepository) Create(ctx context.Context, link *domain.LTIUserLink) (*domain.LTIUserLink, error) {
	if err := r.queries.CreateLTIUserLink(ctx, ltisqlc.CreateLTIUserLinkParams{
		Sub: link.Sub(), Issuer: link.Issuer(), UserID: uint64(link.UserID()),
	}); err != nil {
		return nil, err
	}
	return r.GetBySubAndIssuer(ctx, link.Sub(), link.Issuer())
}
