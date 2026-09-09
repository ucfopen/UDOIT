package infrastructure

import (
	"context"
	"database/sql"
	"encoding/json"

	"rewritetest/internal/content/internal/domain"
	contentsqlc "rewritetest/internal/content/internal/infrastructure/sqlc"
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
		return nil, err
	}

	var externalData map[string]any
	err = json.Unmarshal(row.ExternalData, &externalData)
	if err != nil {
		return nil, err
	}

	contentItem := domain.RehydrateContentItem(
		int64(row.ID),
		int64(row.CourseID),
		row.ContentHash,
		row.ExternalID,
		externalData,
		row.CreatedAt,
		row.UpdatedAt,
	)
	return contentItem, nil
}

func (r *MySQLContentItemRepository) GetByCourseID(ctx context.Context, courseID int64) ([]*domain.ContentItem, error) {
	rows, err := r.queries.GetContentItemsByCourseID(ctx, uint64(courseID))
	if err != nil {
		return nil, err
	}

	contentItems := make([]*domain.ContentItem, 0, len(rows))
	for _, row := range rows {

		var externalData map[string]any
		err := json.Unmarshal(row.ExternalData, &externalData)
		if err != nil {
			return nil, err
		}

		contentItem := domain.RehydrateContentItem(
			int64(row.ID),
			int64(row.CourseID),
			row.ContentHash,
			row.ExternalID,
			externalData,
			row.CreatedAt,
			row.UpdatedAt,
		)
		contentItems = append(contentItems, contentItem)
	}

	return contentItems, nil
}

func (r *MySQLContentItemRepository) Create(ctx context.Context, contentItem *domain.ContentItem) error {
	externalData, err := json.Marshal(contentItem.ExternalData())
	if err != nil {
		return err
	}
	_, err = r.queries.CreateContentItem(ctx, contentsqlc.CreateContentItemParams{
		CourseID:     uint64(contentItem.CourseID()),
		ContentHash:  contentItem.ContentHash(),
		ExternalID:   contentItem.ExternalID(),
		ExternalData: externalData,
	})

	return err
}

func (r *MySQLContentItemRepository) CreateMany(ctx context.Context, contentItems []*domain.ContentItem) (map[string]int64, error) {
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
			CourseID:     uint64(item.CourseID()),
			ContentHash:  item.ContentHash(),
			ExternalID:   item.ExternalID(),
			ExternalData: externalData,
		}
	}

	idMap := map[string]int64{}

	for _, params := range domainContentItemsParams {
		result, err := qtx.CreateContentItem(ctx, params)
		if err != nil {
			return nil, err
		}

		insertedID, err := result.LastInsertId()
		if err != nil {
			return nil, err
		}

		idMap[params.ExternalID] = insertedID
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return idMap, nil
}

var _ domain.ContentItemRepository = (*MySQLContentItemRepository)(nil)
