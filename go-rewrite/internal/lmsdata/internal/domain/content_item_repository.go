package domain

import "context"

type ContentItemRepository interface {
	GetByID(ctx context.Context, id int64) (*ContentItem, error)
	GetByCourseID(ctx context.Context, courseID int64) ([]*ContentItem, error)
	Create(ctx context.Context, contentItem *ContentItem) (*ContentItem, error)
	CreateMany(ctx context.Context, contentItems []*ContentItem) ([]*ContentItem, error)
}
