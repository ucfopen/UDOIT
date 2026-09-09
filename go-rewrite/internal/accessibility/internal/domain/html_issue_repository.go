package domain

import "context"

type HTMLIssueRepository interface {
	DeleteByContentItemIDs(ctx context.Context, contentItemIDs []int64) error
	CreateMany(ctx context.Context, issues []*HTMLIssue) error
	GetByCourseID(ctx context.Context, courseID int64) ([]*HTMLIssue, error)
}
