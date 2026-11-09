package lms

import (
	"context"

	"rewritetest/internal/lms/internal/provider"
	"rewritetest/internal/lms/internal/record"
	"rewritetest/internal/shared/apperr"
	"rewritetest/internal/shared/auth"
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

func (m *Service) UpdateContentHTML(ctx context.Context, principal auth.Principal, contentItemID int64, html string) error {
	course, content, lmsProvider, err := m.contentProviderForPrincipal(ctx, principal, contentItemID)
	if err != nil {
		return err
	}
	return lmsProvider.UpdateContentHTML(ctx, principal.AgentID,
		provider.Course{ID: course.ID, ExternalID: course.ExternalID, ExternalData: course.ExternalData},
		provider.ContentItem{ID: content.ID, ExternalID: content.ExternalID, ExternalData: content.ExternalData},
		html,
	)
}

func (m *Service) GetContentHTML(ctx context.Context, principal auth.Principal, contentItemID int64) (string, error) {
	course, content, lmsProvider, err := m.contentProviderForPrincipal(ctx, principal, contentItemID)
	if err != nil {
		return "", err
	}
	return lmsProvider.GetContentHTML(ctx, principal.AgentID,
		provider.Course{ID: course.ID, ExternalID: course.ExternalID, ExternalData: course.ExternalData},
		provider.ContentItem{ID: content.ID, ExternalID: content.ExternalID, ExternalData: content.ExternalData},
	)
}

func (m *Service) contentProviderForPrincipal(ctx context.Context, principal auth.Principal, contentItemID int64) (record.Course, record.Content, provider.Provider, error) {
	content, found, err := m.store.ContentByID(ctx, contentItemID)
	if err != nil {
		return record.Course{}, record.Content{}, nil, err
	}
	if !found {
		return record.Course{}, record.Content{}, nil, apperr.New(apperr.CodeNotFound, "Content item not found")
	}

	course, found, err := m.store.CourseByID(ctx, content.CourseID)
	if err != nil {
		return record.Course{}, record.Content{}, nil, err
	}
	if !found || course.TenantID != principal.TenantID {
		return record.Course{}, record.Content{}, nil, apperr.New(apperr.CodeNotFound, "Content item not found")
	}

	lmsProvider, err := m.providerForTenant(ctx, principal.TenantID)
	if err != nil {
		return record.Course{}, record.Content{}, nil, err
	}
	return course, content, lmsProvider, nil
}
