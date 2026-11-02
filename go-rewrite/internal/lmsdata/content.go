package lmsdata

import (
	"context"

	"rewritetest/internal/lms"
)

type ContentItem = lms.ContentItem

func (m *Module) GetContentItemsByCourse(ctx context.Context, courseID int64) ([]ContentItem, error) {
	return m.integration.GetContentItemsByCourse(ctx, courseID)
}

func (m *Module) CreateManyContentItems(ctx context.Context, contentItems []ContentItem) ([]ContentItem, error) {
	return m.integration.CreateManyContentItems(ctx, contentItems)
}
