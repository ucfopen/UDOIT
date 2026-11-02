package infrastructure

import (
	"context"
	"database/sql"

	"rewritetest/internal/lms/internal/domain"
	lmssqlc "rewritetest/internal/lms/internal/infrastructure/sqlc"
)

type MySQLFileReferenceRepository struct {
	db      *sql.DB
	queries *lmssqlc.Queries
}

func NewMySQLFileReferenceRepository(db *sql.DB) *MySQLFileReferenceRepository {
	return &MySQLFileReferenceRepository{db: db, queries: lmssqlc.New(db)}
}

func (r *MySQLFileReferenceRepository) ReplaceForContentItems(ctx context.Context, contentItemIDs []int64, fileReferences []*domain.FileReference) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	qtx := r.queries.WithTx(tx)
	if len(contentItemIDs) > 0 {
		ids := make([]uint64, len(contentItemIDs))
		for i, id := range contentItemIDs {
			ids[i] = uint64(id)
		}
		if err := qtx.DeleteFileReferencesByContentItemIDs(ctx, ids); err != nil {
			return err
		}
	}
	for _, reference := range fileReferences {
		if err := qtx.CreateFileReference(ctx, lmssqlc.CreateFileReferenceParams{
			ContentItemID: uint64(reference.ContentItemID()), FileID: uint64(reference.FileID()),
		}); err != nil {
			return err
		}
	}
	return tx.Commit()
}

var _ domain.FileReferenceRepository = (*MySQLFileReferenceRepository)(nil)
