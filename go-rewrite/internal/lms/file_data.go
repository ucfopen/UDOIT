package lms

import (
	"context"
	"time"

	"rewritetest/internal/lms/internal/domain"
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

func (m *Module) SyncFilesForCourse(ctx context.Context, courseID int64, files []FileSyncInput) error {
	records := make([]domain.CourseFileSyncRecord, len(files))
	for i, file := range files {
		records[i] = domain.CourseFileSyncRecord{
			FileName: file.FileName, FileType: file.FileType,
			UpdatedAt: file.UpdatedAt.Format(time.RFC3339), FileSize: file.FileSize,
			DownloadURL: file.DownloadURL, ExternalID: file.ExternalID, ExternalData: file.ExternalData,
		}
	}
	return m.fileRepository.UpsertByCourse(ctx, courseID, records)
}

func (m *Module) GetFilesByCourse(ctx context.Context, courseID int64) ([]File, error) {
	files, err := m.fileRepository.GetByCourseID(ctx, courseID)
	if err != nil {
		return nil, err
	}
	result := make([]File, len(files))
	for i, file := range files {
		result[i] = fileFromDomain(file)
	}
	return result, nil
}

func (m *Module) GetFile(ctx context.Context, fileID int64) (File, error) {
	file, err := m.fileRepository.GetFileByID(ctx, fileID)
	if err != nil {
		return File{}, err
	}
	if file == nil {
		return File{}, apperr.New(apperr.CodeNotFound, "The requested file was not found.")
	}
	return fileFromDomain(file), nil
}

func (m *Module) UpdateFile(ctx context.Context, file File) error {
	return m.fileRepository.UpdateFile(ctx, domain.RehydrateFile(
		file.ID, file.CourseID, file.FileName, file.FileType, file.UpdatedAt,
		file.FileSize, file.DownloadURL, file.ExternalID, file.ExternalData,
	))
}

func fileFromDomain(file *domain.File) File {
	return File{
		ID: file.ID(), CourseID: file.CourseID(), FileName: file.FileName(), FileType: file.FileType(),
		UpdatedAt: file.UpdatedAt(), FileSize: file.FileSize(), DownloadURL: file.DownloadURL(),
		ExternalID: file.ExternalID(), ExternalData: file.ExternalData(),
	}
}
