package lms

import (
	"context"
	"time"

	"rewritetest/internal/lms/internal/record"
	"rewritetest/internal/shared/apperr"
)

// File is a persisted LMS file record.
type File struct {
	ID           int64
	CourseID     int64
	FileName     string
	FileType     string
	UpdatedAt    time.Time
	FileSize     int64
	DownloadURL  string
	ExternalID   string
	ExternalData map[string]any
}

// FileSyncInput describes provider file data to persist for a course.
type FileSyncInput struct {
	FileName     string
	FileType     string
	UpdatedAt    time.Time
	FileSize     int64
	DownloadURL  string
	ExternalID   string
	ExternalData map[string]any
}

func (m *Service) SyncFilesForCourse(ctx context.Context, courseID int64, files []FileSyncInput) error {
	records := make([]record.FileSync, len(files))
	for i, file := range files {
		records[i] = record.FileSync{
			FileName: file.FileName, FileType: file.FileType,
			UpdatedAt: file.UpdatedAt, FileSize: file.FileSize,
			DownloadURL: file.DownloadURL, ExternalID: file.ExternalID, ExternalData: file.ExternalData,
		}
	}
	return m.store.SyncFiles(ctx, courseID, records)
}

func (m *Service) GetFilesByCourse(ctx context.Context, courseID int64) ([]File, error) {
	files, err := m.store.FilesByCourse(ctx, courseID)
	if err != nil {
		return nil, err
	}
	result := make([]File, len(files))
	for i, file := range files {
		result[i] = fileFromRecord(file)
	}
	return result, nil
}

func (m *Service) GetFile(ctx context.Context, fileID int64) (File, error) {
	file, found, err := m.store.FileByID(ctx, fileID)
	if err != nil {
		return File{}, err
	}
	if !found {
		return File{}, apperr.New(apperr.CodeNotFound, "The requested file was not found.")
	}
	return fileFromRecord(file), nil
}

func (m *Service) UpdateFile(ctx context.Context, file File) error {
	return m.store.UpdateFile(ctx, record.File{
		ID: file.ID, CourseID: file.CourseID, FileName: file.FileName, FileType: file.FileType, UpdatedAt: file.UpdatedAt,
		FileSize: file.FileSize, DownloadURL: file.DownloadURL, ExternalID: file.ExternalID, ExternalData: file.ExternalData,
	})
}

func fileFromRecord(file record.File) File {
	return File{
		ID: file.ID, CourseID: file.CourseID, FileName: file.FileName, FileType: file.FileType,
		UpdatedAt: file.UpdatedAt, FileSize: file.FileSize, DownloadURL: file.DownloadURL,
		ExternalID: file.ExternalID, ExternalData: file.ExternalData,
	}
}
