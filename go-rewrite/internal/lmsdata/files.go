package lmsdata

import (
	"context"
	"fmt"

	"rewritetest/internal/lms"
	"rewritetest/internal/lmsdata/internal/domain"

	"rewritetest/internal/shared/auth"
)

type FileReferenceResolver interface {
	ResolveFileReferences(ctx context.Context, req lms.ResolveFileReferencesRequest) ([]lms.ResolvedFileReference, error)
}

type File = lms.File

type FileReference struct {
	ContentItemID int64
	FileID        int64
}

func (m *Module) replaceFileReferences(ctx context.Context, contentItemIDs []int64, fileReferences []FileReference) error {
	domainReferences := make([]*domain.FileReference, len(fileReferences))
	for i, fileReference := range fileReferences {
		domainReferences[i] = domain.NewFileReference(fileReference.ContentItemID, fileReference.FileID)
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
	course, err := m.integration.GetCourse(ctx, request.CourseID)
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

	files, err := m.integration.GetFilesByCourse(ctx, request.CourseID)
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
		Course: lms.CourseInfo{
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

func (m *Module) GetFile(ctx context.Context, fileID int64) (File, error) {
	return m.integration.GetFile(ctx, fileID)
}

func (m *Module) UpdateFile(ctx context.Context, file File) error {
	return m.integration.UpdateFile(ctx, file)
}
