package lms

import (
	"context"

	"rewritetest/internal/lms/internal/domain"
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

func (m *Module) GetCourseContent(ctx context.Context, req GetCourseContentRequest) (ExternalCourseContent, error) {
	lmsProvider, err := m.providerResolver.GetByTenant(ctx, req.TenantID)
	if err != nil {
		return ExternalCourseContent{}, err
	}

	lmsContent := make([]domain.LMSContent, len(req.CurrentContent))
	for i, item := range req.CurrentContent {
		lmsContent[i] = domain.LMSContent{
			ID:           item.ID,
			ExternalID:   item.ExternalID,
			ExternalData: item.ExternalData,
		}
	}

	syncData, err := lmsProvider.GetContent(ctx, domain.LMSCourse{
		ID:           req.CourseID,
		ExternalID:   req.ExternalCourseID,
		ExternalData: req.ExternalCourseData,
	}, lmsContent, req.UserID)
	if err != nil {
		return ExternalCourseContent{}, err
	}

	contentItems := make([]ExternalContentItem, len(syncData.ContentItems))
	for i, item := range syncData.ContentItems {
		contentItems[i] = ExternalContentItem{
			ExternalID:   item.ExternalID,
			ExternalData: item.ExternalData,
			HTML:         item.HTML,
		}
	}

	files := make([]ExternalFile, len(syncData.Files))
	for i, file := range syncData.Files {
		files[i] = ExternalFile{
			FileName:     file.FileName,
			FileType:     file.FileType,
			UpdatedAt:    file.UpdatedAt,
			FileSize:     file.FileSize,
			DownloadURL:  file.DownloadURL,
			ExternalID:   file.ExternalID,
			ExternalData: file.ExternalData,
		}
	}

	return ExternalCourseContent{ContentItems: contentItems, Files: files}, nil
}
