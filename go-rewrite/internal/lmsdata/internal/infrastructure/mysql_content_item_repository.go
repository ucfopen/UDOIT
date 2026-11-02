package infrastructure

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"

	"rewritetest/internal/lmsdata/internal/domain"
	contentsqlc "rewritetest/internal/lmsdata/internal/infrastructure/sqlc"
)

type MySQLContentItemRepository struct {
	queries *contentsqlc.Queries
	db      *sql.DB
}

func NewMySQLContentItemRepository(db *sql.DB) *MySQLContentItemRepository {
	return &MySQLContentItemRepository{
		queries: contentsqlc.New(db),
		db:      db,
	}
}

func (r *MySQLContentItemRepository) GetByID(ctx context.Context, id int64) (*domain.ContentItem, error) {
	row, err := r.queries.GetContentItemByID(ctx, uint64(id))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return r.toDomain(row)
}

func (r *MySQLContentItemRepository) GetByCourseID(ctx context.Context, courseID int64) ([]*domain.ContentItem, error) {
	rows, err := r.queries.GetContentItemsByCourseID(ctx, uint64(courseID))
	if err != nil {
		return nil, err
	}

	contentItems := make([]*domain.ContentItem, 0, len(rows))
	for _, row := range rows {
		contentItem, err := r.toDomain(contentsqlc.GetContentItemByIDRow(row))
		if err != nil {
			return nil, err
		}
		contentItems = append(contentItems, contentItem)
	}

	return contentItems, nil
}

func (r *MySQLContentItemRepository) Create(ctx context.Context, contentItem *domain.ContentItem) (*domain.ContentItem, error) {
	externalData, err := json.Marshal(contentItem.ExternalData())
	if err != nil {
		return nil, err
	}
	result, err := r.queries.CreateContentItem(ctx, contentsqlc.CreateContentItemParams{
		CourseID:         uint64(contentItem.CourseID()),
		ContentHash:      contentItem.ContentHash(),
		ExternalID:       contentItem.ExternalID(),
		ExternalData:     externalData,
		ContentChangedAt: contentItem.ContentChangedAt(),
	})

	if err != nil {
		return nil, err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}
	return r.getByID(ctx, id)
}

func (r *MySQLContentItemRepository) CreateMany(ctx context.Context, contentItems []*domain.ContentItem) ([]*domain.ContentItem, error) {
	if len(contentItems) == 0 {
		return []*domain.ContentItem{}, nil
	}
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	qtx := r.queries.WithTx(tx)

	domainContentItemsParams := make([]contentsqlc.CreateContentItemParams, len(contentItems))
	for i, item := range contentItems {

		externalData, err := json.Marshal(item.ExternalData())
		if err != nil {
			return nil, err
		}

		domainContentItemsParams[i] = contentsqlc.CreateContentItemParams{
			CourseID:         uint64(item.CourseID()),
			ContentHash:      item.ContentHash(),
			ExternalID:       item.ExternalID(),
			ExternalData:     externalData,
			ContentChangedAt: item.ContentChangedAt(),
		}
	}

	persisted := make([]*domain.ContentItem, 0, len(contentItems))

	for _, params := range domainContentItemsParams {
		result, err := qtx.CreateContentItem(ctx, params)
		if err != nil {
			return nil, err
		}

		insertedID, err := result.LastInsertId()
		if err != nil {
			return nil, err
		}
		item, err := r.getByIDTx(ctx, qtx, insertedID)
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

func (r *MySQLContentItemRepository) getByID(ctx context.Context, id int64) (*domain.ContentItem, error) {
	row, err := r.queries.GetContentItemByID(ctx, uint64(id))
	if err != nil {
		return nil, err
	}
	return r.toDomain(row)
}

func (r *MySQLContentItemRepository) getByIDTx(ctx context.Context, queries *contentsqlc.Queries, id int64) (*domain.ContentItem, error) {
	row, err := queries.GetContentItemByID(ctx, uint64(id))
	if err != nil {
		return nil, err
	}
	return r.toDomain(row)
}

func (r *MySQLContentItemRepository) toDomain(row contentsqlc.GetContentItemByIDRow) (*domain.ContentItem, error) {
	var externalData map[string]any
	if err := json.Unmarshal(row.ExternalData, &externalData); err != nil {
		return nil, err
	}
	return domain.RehydrateContentItem(int64(row.ID), int64(row.CourseID), row.ContentHash, row.ExternalID, externalData, row.ContentChangedAt, row.CreatedAt, row.UpdatedAt), nil
}

var _ domain.ContentItemRepository = (*MySQLContentItemRepository)(nil)
