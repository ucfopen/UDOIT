package lmsdata

import (
	"context"
	"fmt"
	"rewritetest/internal/lms"
	fileReferencesDomain "rewritetest/internal/lmsdata/internal/file_references/domain"
	filesdomain "rewritetest/internal/lmsdata/internal/files/domain"

	"rewritetest/internal/shared/auth"
	"time"
)

type FileReferenceResolver interface {
	ResolveFileReferences(ctx context.Context, req lms.ResolveFileReferencesRequest) ([]lms.ResolvedFileReference, error)
}

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

type FileSyncInput struct {
	FileName     string
	FileType     string
	UpdatedAt    time.Time
	FileSize     int64
	DownloadURL  string
	ExternalID   string
	ExternalData map[string]any
}

type FileReference struct {
	ContentItemID int64
	FileID        int64
}


func (m *Module) replaceFileReferences(ctx context.Context, contentItemIDs []int64, fileReferences []FileReference) error {
	domainReferences := make([]*fileReferencesDomain.FileReference, len(fileReferences))
	for i, fileReference := range fileReferences {
		domainReferences[i] = fileReferencesDomain.NewFileReference(fileReference.ContentItemID, fileReference.FileID)
	}

	return m.fileReferenceRepository.ReplaceForContentItems(ctx, contentItemIDs, domainReferences)
}

type AddFileReferencesRequest struct {
	CourseID       int64
	ContentItemIDs []int64
	References     []FileReferenceInput
}

type FileReferenceInput struct {
	ContentItemID int64
	Kind          string
	TagName       string
	Attribute     string
	Value         string
	XPath         string
}


func (m *Module) AddFileReferences(ctx context.Context, principal auth.Principal, request AddFileReferencesRequest) error {
	course, err := m.GetCourse(ctx, request.CourseID)
	if err != nil {
		return err
	}

	contentItems, err := m.GetContentItemsByCourse(ctx, request.CourseID)
	if err != nil {
		return err
	}
	contentExternalIDs := make(map[int64]string, len(contentItems))
	for _, item := range contentItems {
		contentExternalIDs[item.ID] = item.ExternalID
	}

	externalReferences := make([]lms.ExternalContentReference, 0, len(request.References))
	for _, reference := range request.References {
		externalID, ok := contentExternalIDs[reference.ContentItemID]
		if !ok || externalID == "" {
			continue
		}
		externalReferences = append(externalReferences, lms.ExternalContentReference{
			ContentExternalID: externalID,
			Kind:              reference.Kind,
			TagName:           reference.TagName,
			Attribute:         reference.Attribute,
			Value:             reference.Value,
			XPath:             reference.XPath,
		})
	}

	files, err := m.GetFilesByCourse(ctx, request.CourseID)
	if err != nil {
		return err
	}

	externalFiles := make([]lms.ExternalFile, len(files))
	for i, file := range files {
		externalFiles[i] = lms.ExternalFile{
			FileName:     file.FileName,
			FileType:     file.FileType,
			UpdatedAt:    file.UpdatedAt,
			FileSize:     file.FileSize,
			DownloadURL:  file.DownloadURL,
			ExternalID:   file.ExternalID,
			ExternalData: file.ExternalData,
		}
	}
	
	resolved, err := m.integration.ResolveFileReferences(ctx, lms.ResolveFileReferencesRequest{
		Course:     lms.CourseInfo{
			ID:           course.ID,
			ExternalID:   course.ExternalID,
			ExternalData: course.ExternalData,
		},
		References:     externalReferences,
		PersistedFiles: externalFiles,
		TenantID:       principal.TenantID,
	})
	if err != nil {
		return err
	}

	contentIDsByExternalID := make(map[string]int64, len(contentItems))
	for _, item := range contentItems {
		contentIDsByExternalID[item.ExternalID] = item.ID
	}
	fileIDsByExternalID := make(map[string]int64, len(files))
	for _, file := range files {
		fileIDsByExternalID[file.ExternalID] = file.ID
	}

	fileReferences := make([]FileReference, 0, len(resolved))
	seen := make(map[string]struct{}, len(resolved))
	for _, reference := range resolved {
		contentID, contentOK := contentIDsByExternalID[reference.ContentExternalID]
		fileID, fileOK := fileIDsByExternalID[reference.FileExternalID]
		if !contentOK || !fileOK {
			continue
		}
		key := fmt.Sprintf("%d:%d", contentID, fileID)
		if _, ok := seen[key]; ok {
			continue
		}
		seen[key] = struct{}{}
		fileReferences = append(fileReferences, FileReference{ContentItemID: contentID, FileID: fileID})
	}

	return m.replaceFileReferences(ctx, request.ContentItemIDs, fileReferences)
}

func (m *Module) SyncFilesForCourse(ctx context.Context, courseID int64, files []FileSyncInput) error {
	records := make([]filesdomain.CourseFileSyncRecord, len(files))
	for i, file := range files {
		records[i] = filesdomain.CourseFileSyncRecord{
			FileName:     file.FileName,
			FileType:     file.FileType,
			UpdatedAt:    file.UpdatedAt.Format(time.RFC3339),
			FileSize:     file.FileSize,
			DownloadURL:  file.DownloadURL,
			ExternalID:   file.ExternalID,
			ExternalData: file.ExternalData,
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
		result[i] = File{
			CourseID:     file.CourseID(),
			ID:           file.ID(),
			FileName:     file.FileName(),
			FileType:     file.FileType(),
			UpdatedAt:    file.UpdatedAt(),
			FileSize:     file.FileSize(),
			DownloadURL:  file.DownloadURL(),
			ExternalID:   file.ExternalID(),
			ExternalData: file.ExternalData(),
		}
	}

	return result, nil
}
