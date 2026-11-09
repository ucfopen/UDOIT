package mysql

import (
	"context"
	"database/sql"
	"encoding/json"

	"rewritetest/internal/lms/internal/record"
	lmssqlc "rewritetest/internal/lms/internal/storage/mysql/sqlc"
)

func (r *Store) ContentByID(ctx context.Context, contentID int64) (record.Content, bool, error) {
	row, err := r.queries.GetContentItemMappingByID(ctx, uint64(contentID))
	if err != nil {
		if err == sql.ErrNoRows {
			return record.Content{}, false, nil
		}
		return record.Content{}, false, err
	}
	var externalData map[string]any
	if err := json.Unmarshal(row.ExternalData, &externalData); err != nil {
		return record.Content{}, false, err
	}
	return record.Content{
		ID: int64(row.ID), CourseID: int64(row.CourseID), ContentHash: row.ContentHash,
		ExternalID: row.ExternalID, ExternalData: externalData, CreatedAt: row.CreatedAt, UpdatedAt: row.UpdatedAt,
	}, true, nil
}

func (r *Store) ContentByCourse(ctx context.Context, courseID int64) ([]record.Content, error) {
	rows, err := r.queries.GetContentItemsByCourseID(ctx, uint64(courseID))
	if err != nil {
		return nil, err
	}
	contentItems := make([]record.Content, 0, len(rows))
	for _, row := range rows {
		contentItem, err := r.contentFromRow(lmssqlc.GetContentItemByIDRow(row))
		if err != nil {
			return nil, err
		}
		contentItems = append(contentItems, contentItem)
	}
	return contentItems, nil
}

func (r *Store) UpsertContent(ctx context.Context, contentItems []record.Content) ([]record.Content, error) {
	if len(contentItems) == 0 {
		return []record.Content{}, nil
	}
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()
	qtx := r.queries.WithTx(tx)
	persisted := make([]record.Content, 0, len(contentItems))
	for _, contentItem := range contentItems {
		params, err := contentItemParams(contentItem)
		if err != nil {
			return nil, err
		}
		result, err := qtx.CreateContentItem(ctx, params)
		if err != nil {
			return nil, err
		}
		id, err := result.LastInsertId()
		if err != nil {
			return nil, err
		}
		item, err := r.contentByIDTx(ctx, qtx, id)
		if err != nil {
			return nil, err
		}
		persisted = append(persisted, item)
	}
	if err := tx.Commit(); err != nil {
		return nil, err
	}
	return persisted, nil
}

func contentItemParams(item record.Content) (lmssqlc.CreateContentItemParams, error) {
	externalData, err := json.Marshal(item.ExternalData)
	if err != nil {
		return lmssqlc.CreateContentItemParams{}, err
	}
	return lmssqlc.CreateContentItemParams{
		CourseID:         uint64(item.CourseID),
		ContentHash:      item.ContentHash,
		ContentChangedAt: item.ContentChangedAt,
		ExternalID:       item.ExternalID,
		ExternalData:     externalData,
	}, nil
}

func (r *Store) contentByIDTx(ctx context.Context, queries *lmssqlc.Queries, id int64) (record.Content, error) {
	row, err := queries.GetContentItemByID(ctx, uint64(id))
	if err != nil {
		return record.Content{}, err
	}
	return r.contentFromRow(row)
}

func (r *Store) contentFromRow(row lmssqlc.GetContentItemByIDRow) (record.Content, error) {
	var externalData map[string]any
	if err := json.Unmarshal(row.ExternalData, &externalData); err != nil {
		return record.Content{}, err
	}
	return record.Content{ID: int64(row.ID), CourseID: int64(row.CourseID), ContentHash: row.ContentHash, ExternalID: row.ExternalID, ExternalData: externalData, ContentChangedAt: row.ContentChangedAt, CreatedAt: row.CreatedAt, UpdatedAt: row.UpdatedAt}, nil
}
