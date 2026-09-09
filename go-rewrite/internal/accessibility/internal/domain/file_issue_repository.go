package domain

import "context"

type FileIssueRepository interface {
	ReplaceForCourse(ctx context.Context, courseID int64, fileIDs []int64) error
}
