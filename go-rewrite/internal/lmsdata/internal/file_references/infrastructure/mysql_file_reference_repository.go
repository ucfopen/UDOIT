package infrastructure

import (
	"context"
	"database/sql"

	"rewritetest/internal/lmsdata/internal/file_references/domain"
	file_referencessqlc "rewritetest/internal/lmsdata/internal/file_references/infrastructure/sqlc"
)

type MySQLFileReferenceRepository struct {
	db      *sql.DB
	queries *file_referencessqlc.Queries
}

func NewMySQLFileReferenceRepository(db *sql.DB) *MySQLFileReferenceRepository {
	return &MySQLFileReferenceRepository{
		db:      db,
		queries: file_referencessqlc.New(db),
	}
}

func (r *MySQLFileReferenceRepository) ReplaceForContentItems(ctx context.Context, contentItemIDs []int64, fileReferences []*domain.FileReference) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	qtx := r.queries.WithTx(tx)

	if len(contentItemIDs) > 0 {
		uintContentItemIDs := make([]uint64, len(contentItemIDs))
		for i, id := range contentItemIDs {
			uintContentItemIDs[i] = uint64(id)
		}

		err = qtx.DeleteFileReferencesByContentItemIDs(ctx, uintContentItemIDs)
		if err != nil {
			return err
		}
	}

	for _, fileReference := range fileReferences {
		err = qtx.CreateFileReference(ctx, file_referencessqlc.CreateFileReferenceParams{
			ContentItemID: uint64(fileReference.ContentItemID()),
			FileID:        uint64(fileReference.FileID()),
		})
		if err != nil {
			return err
		}
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	return nil
}

var _ domain.FileReferenceRepository = (*MySQLFileReferenceRepository)(nil)
