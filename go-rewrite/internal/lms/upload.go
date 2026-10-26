package lms

import (
	"context"
	"time"

	"rewritetest/internal/lms/internal/domain"
	"rewritetest/internal/shared/auth"
)

// FileInfo identifies the LMS file being replaced without exposing provider-
// specific file fields to the application layer.
type FileInfo struct {
	ID           int64
	FileName     string
	FileType     string
	UpdatedAt    time.Time
	FileSize     int64
	DownloadURL  string
	ExternalID   string
	ExternalData map[string]any
}

// BeginFileUploadRequest contains the information required to negotiate a
// direct upload target with an LMS provider.
type BeginFileUploadRequest struct {
	Principal   auth.Principal
	Course      CourseInfo
	File        FileInfo
	NewFileName string
	NewFileSize int64
}

// FileUploadInstruction tells the browser how to upload directly to the LMS.
// The application server does not receive the file contents.
type FileUploadInstruction struct {
	Method    string
	URL       string
	Fields    map[string]string
	Headers   map[string]string
	ExpiresAt time.Time
}

// CompleteFileUploadRequest contains the provider response received after the
// browser has uploaded the file directly to the LMS.
type CompleteFileUploadRequest struct {
	Principal      auth.Principal
	Course         CourseInfo
	File           FileInfo
	NewFileName    string
	UploadResponse map[string]any
}

// UploadedFile is the provider-neutral representation to persist after a
// successful replacement upload.
type UploadedFile struct {
	FileName     string
	FileType     string
	UpdatedAt    time.Time
	FileSize     int64
	DownloadURL  string
	ExternalID   string
	ExternalData map[string]any
}

// FileUploader negotiates and completes direct file uploads through an LMS.
type FileUploader interface {
	BeginFileUpload(context.Context, BeginFileUploadRequest) (FileUploadInstruction, error)
	CompleteFileUpload(context.Context, CompleteFileUploadRequest) (UploadedFile, error)
}

func (m *Module) BeginFileUpload(ctx context.Context, req BeginFileUploadRequest) (FileUploadInstruction, error) {
	provider, err := m.providerResolver.GetByTenant(ctx, req.Principal.TenantID)
	if err != nil {
		return FileUploadInstruction{}, err
	}

	target, err := provider.BeginFileUpload(
		ctx,
		req.Principal,
		toProviderCourse(req.Course),
		toProviderFile(req.File),
		req.NewFileName,
		req.NewFileSize,
	)
	if err != nil {
		return FileUploadInstruction{}, err
	}

	return FileUploadInstruction{
		Method:    target.Method,
		URL:       target.URL,
		Fields:    target.Fields,
		Headers:   target.Headers,
		ExpiresAt: target.ExpiresAt,
	}, nil
}

func (m *Module) CompleteFileUpload(ctx context.Context, req CompleteFileUploadRequest) (UploadedFile, error) {
	provider, err := m.providerResolver.GetByTenant(ctx, req.Principal.TenantID)
	if err != nil {
		return UploadedFile{}, err
	}

	file, err := provider.CompleteFileUpload(
		ctx,
		req.Principal,
		toProviderCourse(req.Course),
		toProviderFile(req.File),
		req.NewFileName,
		req.UploadResponse,
	)
	if err != nil {
		return UploadedFile{}, err
	}

	return UploadedFile{
		FileName:     file.FileName,
		FileType:     file.FileType,
		UpdatedAt:    file.UpdatedAt,
		FileSize:     file.FileSize,
		DownloadURL:  file.DownloadURL,
		ExternalID:   file.ExternalID,
		ExternalData: file.ExternalData,
	}, nil
}

func toProviderCourse(course CourseInfo) domain.LMSCourse {
	return domain.LMSCourse{
		ID:           course.ID,
		ExternalID:   course.ExternalID,
		ExternalData: course.ExternalData,
	}
}

func toProviderFile(file FileInfo) domain.CourseFile {
	return domain.CourseFile{
		FileName:     file.FileName,
		FileType:     file.FileType,
		UpdatedAt:    file.UpdatedAt,
		FileSize:     file.FileSize,
		DownloadURL:  file.DownloadURL,
		ExternalID:   file.ExternalID,
		ExternalData: file.ExternalData,
	}
}
