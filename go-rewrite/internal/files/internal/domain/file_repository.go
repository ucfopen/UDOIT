package domain

import "context"

type CourseFileSyncRecord struct {
	FileName     string
	FileType     string
	UpdatedAt    string
	FileSize     int64
	DownloadURL  string
	ExternalID   string
	ExternalData map[string]any
}

type FileRepository interface {
	GetFileByID(ctx context.Context, fileID int64) (*File, error)
	GetByCourseID(ctx context.Context, courseID int64) ([]*File, error)
	UpdateFile(ctx context.Context, file *File) error
	DeleteFile(ctx context.Context, fileID int64) error
	UpsertByCourse(ctx context.Context, courseID int64, records []CourseFileSyncRecord) error
}
