package mysql

import (
	"context"

	"rewritetest/internal/lms/internal/record"
	lmssqlc "rewritetest/internal/lms/internal/storage/mysql/sqlc"
)

func (r *Store) ReplaceFileReferences(ctx context.Context, contentItemIDs []int64, fileReferences []record.FileReference) error {
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
			ContentItemID: uint64(reference.ContentItemID), FileID: uint64(reference.FileID),
		}); err != nil {
			return err
		}
	}
	return tx.Commit()
}
