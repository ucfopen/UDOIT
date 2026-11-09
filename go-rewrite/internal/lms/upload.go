package lms

import (
	"context"
	"time"

	"rewritetest/internal/lms/internal/provider"
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

func (m *Service) BeginFileUpload(ctx context.Context, req BeginFileUploadRequest) (FileUploadInstruction, error) {
	providerAdapter, err := m.providerForTenant(ctx, req.Principal.TenantID)
	if err != nil {
		return FileUploadInstruction{}, err
	}
	userID := req.Principal.AgentID
	target, err := providerAdapter.BeginFileUpload(ctx, userID, provider.Course{ID: req.Course.ID, ExternalID: req.Course.ExternalID, ExternalData: req.Course.ExternalData}, provider.File{FileName: req.File.FileName, FileType: req.File.FileType, UpdatedAt: req.File.UpdatedAt, FileSize: req.File.FileSize, DownloadURL: req.File.DownloadURL, ExternalID: req.File.ExternalID, ExternalData: req.File.ExternalData}, req.NewFileName, req.NewFileSize)
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

func (m *Service) CompleteFileUpload(ctx context.Context, req CompleteFileUploadRequest) (UploadedFile, error) {
	providerAdapter, err := m.providerForTenant(ctx, req.Principal.TenantID)
	if err != nil {
		return UploadedFile{}, err
	}

	file, err := providerAdapter.CompleteFileUpload(ctx, req.Principal.AgentID, provider.Course{ID: req.Course.ID, ExternalID: req.Course.ExternalID, ExternalData: req.Course.ExternalData}, provider.File{FileName: req.File.FileName, FileType: req.File.FileType, UpdatedAt: req.File.UpdatedAt, FileSize: req.File.FileSize, DownloadURL: req.File.DownloadURL, ExternalID: req.File.ExternalID, ExternalData: req.File.ExternalData}, req.NewFileName, req.UploadResponse)
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
