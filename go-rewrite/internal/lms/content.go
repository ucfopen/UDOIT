package lms

import (
	"context"

	"rewritetest/internal/lms/internal/provider"
)

type GetCourseContentRequest struct {
	CourseID           int64
	ExternalCourseID   string
	ExternalCourseData map[string]any
	TenantID           int64
	UserID             int64
	CurrentContent     []ExistingContentItem
}

type ExistingContentItem struct {
	ID           int64
	ExternalData map[string]any
	ExternalID   string
}

type ExternalCourseContent struct {
	ContentItems []ExternalContentItem
	Files        []ExternalFile
}

type ExternalContentItem struct {
	ExternalID   string
	ExternalData map[string]any
	HTML         string
}

func (m *Service) GetCourseContent(ctx context.Context, req GetCourseContentRequest) (ExternalCourseContent, error) {
	lmsProvider, err := m.providerForTenant(ctx, req.TenantID)
	if err != nil {
		return ExternalCourseContent{}, err
	}
	providerContent := make([]provider.ContentItem, len(req.CurrentContent))
	for i, item := range req.CurrentContent {
		providerContent[i] = provider.ContentItem{ID: item.ID, ExternalID: item.ExternalID, ExternalData: item.ExternalData}
	}
	snapshot, err := lmsProvider.GetContent(ctx, req.UserID, provider.Course{ID: req.CourseID, ExternalID: req.ExternalCourseID, ExternalData: req.ExternalCourseData}, providerContent)
	if err != nil {
		return ExternalCourseContent{}, err
	}
	contentItems := make([]ExternalContentItem, len(snapshot.ContentItems))
	for i, item := range snapshot.ContentItems {
		contentItems[i] = ExternalContentItem{ExternalID: item.ExternalID, ExternalData: item.ExternalData, HTML: item.HTML}
	}
	files := make([]ExternalFile, len(snapshot.Files))
	for i, file := range snapshot.Files {
		files[i] = ExternalFile{FileName: file.FileName, FileType: file.FileType, UpdatedAt: file.UpdatedAt, FileSize: file.FileSize, DownloadURL: file.DownloadURL, ExternalID: file.ExternalID, ExternalData: file.ExternalData}
	}
	return ExternalCourseContent{ContentItems: contentItems, Files: files}, nil
}
