package lmsdata

import (
	"context"
	"time"

	contentdomain "rewritetest/internal/lmsdata/internal/content/domain"
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

func (m *Module) CreateContentItem(ctx context.Context, contentItem ContentItem) error {
	return m.contentItemRepository.Create(ctx, contentdomain.NewContentItem(
		contentItem.CourseID,
		contentItem.ContentHash,
		contentItem.ExternalID,
		contentItem.ExternalData,
		contentItem.ContentChangedAt,
	))
}

// CreateManyContentItems upserts content items and returns their database IDs.
func (m *Module) CreateManyContentItems(ctx context.Context, contentItems []ContentItem) (map[string]int64, error) {
	domainContentItems := make([]*contentdomain.ContentItem, len(contentItems))
	for i, item := range contentItems {
		domainContentItems[i] = contentdomain.NewContentItem(
			item.CourseID,
			item.ContentHash,
			item.ExternalID,
			item.ExternalData,
			item.ContentChangedAt,
		)
	}

	return m.contentItemRepository.CreateMany(ctx, domainContentItems)
}
