package content

import (
	"context"
	"database/sql"

	"rewritetest/internal/content/internal/domain"
	"rewritetest/internal/content/internal/infrastructure"
)

type Module struct {
	contentItemRepository domain.ContentItemRepository
}

type ContentItem struct {
	ID           int64
	ExternalID   string
	ExternalData map[string]any
	ContentHash  string
	CourseID     int64
}

func New(db *sql.DB) *Module {
	contentItemRepository := infrastructure.NewMySQLContentItemRepository(db)

	return &Module{
		contentItemRepository: contentItemRepository,
	}
}

func (m *Module) GetByCourse(ctx context.Context, courseID int64) ([]ContentItem, error) {
	contentItems, err := m.contentItemRepository.GetByCourseID(ctx, courseID)
	if err != nil {
		return nil, err
	}

	contentItemsResult := make([]ContentItem, len(contentItems))
	for i, item := range contentItems {
		contentItemsResult[i] = ContentItem{
			ID:           item.ID(),
			ExternalID:   item.ExternalID(),
			ContentHash:  item.ContentHash(),
			CourseID:     item.CourseID(),
			ExternalData: item.ExternalData(),
		}
	}
	return contentItemsResult, nil
}

func (m *Module) CreateContentItem(ctx context.Context, contentItem ContentItem) error {
	return m.contentItemRepository.Create(ctx, domain.NewContentItem(
		contentItem.CourseID,
		contentItem.ContentHash,
		contentItem.ExternalID,
		contentItem.ExternalData,
	))
}

// CreateManyContentItems upserts content items and returns a mapping of
// external IDs to their corresponding database IDs.
func (m *Module) CreateManyContentItems(ctx context.Context, contentItems []ContentItem) (map[string]int64, error) {
	domainContentItems := make([]*domain.ContentItem, len(contentItems))
	for i, item := range contentItems {
		domainContentItems[i] = domain.NewContentItem(
			item.CourseID,
			item.ContentHash,
			item.ExternalID,
			item.ExternalData,
		)
	}

	return m.contentItemRepository.CreateMany(ctx, domainContentItems)
}
