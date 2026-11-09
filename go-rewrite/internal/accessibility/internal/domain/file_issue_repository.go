package domain

import "context"

type FileIssueRepository interface {
	SyncForCourse(ctx context.Context, courseID int64, fileIDs []int64) error
	DeleteByFileID(ctx context.Context, fileID int64) error
	GetByID(ctx context.Context, fileID int64) (*FileIssue, error)
	Update(ctx context.Context, file *FileIssue) error
}
