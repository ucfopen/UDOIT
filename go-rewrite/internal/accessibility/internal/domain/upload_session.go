package domain

import (
	"context"
	"time"
)

type FileUploadSession struct {
	ID          string
	UserID      int64
	TenantID    int64
	FileIssueID int64
	FileID      int64
	NewFileName string
	NewFileSize int64
	ExpiresAt   time.Time
}

type FileUploadSessionRepository interface {
	Create(context.Context, FileUploadSession) error
	GetByID(context.Context, string) (*FileUploadSession, error)
	DeleteByID(context.Context, string) error
}
