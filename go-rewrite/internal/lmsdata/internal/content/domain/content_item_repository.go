package domain

import "context"

type ContentItemRepository interface {
	GetByID(ctx context.Context, id int64) (*ContentItem, error)
	GetByCourseID(ctx context.Context, courseID int64) ([]*ContentItem, error)
	Create(ctx context.Context, contentItem *ContentItem) error

	// CreateMany returns a map of external IDs to the corresponding newly created
	// content item IDs and an error if any occurred.
	CreateMany(ctx context.Context, contentItems []*ContentItem) (map[string]int64, error)
}
