package lmsdata

import (
	"context"
	"time"

	"rewritetest/internal/lmsdata/internal/domain"
)

type ContentItem struct {
	ID               int64
	ExternalID       string
	ExternalData     map[string]any
	ContentHash      string
	ContentChangedAt time.Time
	CourseID         int64
}

func (m *Module) GetContentItemsByCourse(ctx context.Context, courseID int64) ([]ContentItem, error) {
	contentItems, err := m.contentItemRepository.GetByCourseID(ctx, courseID)
	if err != nil {
		return nil, err
	}

	result := make([]ContentItem, len(contentItems))
	for i, item := range contentItems {
		result[i] = ContentItem{
			ID:               item.ID(),
			ExternalID:       item.ExternalID(),
			ContentHash:      item.ContentHash(),
			CourseID:         item.CourseID(),
			ExternalData:     item.ExternalData(),
			ContentChangedAt: item.ContentChangedAt(),
		}
	}
	return result, nil
}

// CreateManyContentItems upserts content items and returns the persisted items.
func (m *Module) CreateManyContentItems(ctx context.Context, contentItems []ContentItem) ([]ContentItem, error) {
	domainContentItems := make([]*domain.ContentItem, len(contentItems))
	for i, item := range contentItems {
		domainContentItems[i] = domain.NewContentItem(
			item.CourseID,
			item.ContentHash,
			item.ExternalID,
			item.ExternalData,
			item.ContentChangedAt,
		)
	}

	persisted, err := m.contentItemRepository.CreateMany(ctx, domainContentItems)
	if err != nil {
		return nil, err
	}
	result := make([]ContentItem, len(persisted))
	for i, item := range persisted {
		result[i] = ContentItem{
			ID:               item.ID(),
			ExternalID:       item.ExternalID(),
			ExternalData:     item.ExternalData(),
			ContentHash:      item.ContentHash(),
			ContentChangedAt: item.ContentChangedAt(),
			CourseID:         item.CourseID(),
		}
	}
	return result, nil
}
