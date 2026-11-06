package lms

import (
	"context"
	"fmt"

	"rewritetest/internal/lms/internal/provider"
	"rewritetest/internal/lms/internal/record"
	"rewritetest/internal/shared/auth"
)

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

func (m *Service) AddFileReferences(ctx context.Context, principal auth.Principal, request AddFileReferencesRequest) error {
	course, err := m.GetCourse(ctx, request.CourseID)
	if err != nil {
		return err
	}
	contentItems, err := m.contentByCourse(ctx, request.CourseID)
	if err != nil {
		return err
	}
	contentExternalIDs := make(map[int64]string, len(contentItems))
	for _, item := range contentItems {
		contentExternalIDs[item.ID] = item.ExternalID
	}
	externalReferences := make([]provider.Reference, 0, len(request.References))
	for _, reference := range request.References {
		externalID, ok := contentExternalIDs[reference.ContentItemID]
		if !ok || externalID == "" {
			continue
		}
		externalReferences = append(externalReferences, provider.Reference{
			ContentExternalID: externalID, Kind: reference.Kind, TagName: reference.TagName,
			Attribute: reference.Attribute, Value: reference.Value, XPath: reference.XPath,
		})
	}
	files, err := m.GetFilesByCourse(ctx, request.CourseID)
	if err != nil {
		return err
	}
	externalFiles := make([]provider.File, len(files))
	for i, file := range files {
		externalFiles[i] = provider.File{
			FileName: file.FileName, FileType: file.FileType, UpdatedAt: file.UpdatedAt,
			FileSize: file.FileSize, DownloadURL: file.DownloadURL, ExternalID: file.ExternalID,
			ExternalData: file.ExternalData,
		}
	}
	providerAdapter, err := m.providerForTenant(ctx, principal.TenantID)
	if err != nil {
		return err
	}
	providerCourse := provider.Course{ID: course.ID, ExternalID: course.ExternalID, ExternalData: course.ExternalData}
	resolved, err := providerAdapter.ResolveFileReferences(ctx, providerCourse, externalReferences, externalFiles)
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
	fileReferences := make([]record.FileReference, 0, len(resolved))
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
		fileReferences = append(fileReferences, record.FileReference{ContentItemID: contentID, FileID: fileID})
	}
	return m.store.ReplaceFileReferences(ctx, request.ContentItemIDs, fileReferences)
}
