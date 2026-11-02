package lmsdata

import (
	"context"
	"time"

	"rewritetest/internal/lms"
	"rewritetest/internal/shared/auth"
)

type CourseContentRetriever interface {
	GetCourseContent(ctx context.Context, req lms.GetCourseContentRequest) (lms.ExternalCourseContent, error)
}

func (m *Module) SynchronizeCourse(ctx context.Context, principal auth.Principal, courseID int64, changedSince time.Time) (lms.CourseSynchronization, error) {
	course, err := m.integration.GetCourse(ctx, courseID)
	if err != nil {
		return lms.CourseSynchronization{}, err
	}

	currentContentItems, err := m.integration.GetContentItemsByCourse(ctx, courseID)
	if err != nil {
		return lms.CourseSynchronization{}, err
	}

	lmsContentItems := make([]lms.ExistingContentItem, len(currentContentItems))
	for i, item := range currentContentItems {
		lmsContentItems[i] = lms.ExistingContentItem{
			ID:           item.ID,
			ExternalID:   item.ExternalID,
			ExternalData: item.ExternalData,
		}
	}

	externalContent, err := m.integration.GetCourseContent(ctx, lms.GetCourseContentRequest{
		CourseID:           courseID,
		ExternalCourseID:   course.ExternalID,
		ExternalCourseData: course.ExternalData,
		TenantID:           principal.TenantID,
		UserID:             principal.AgentID,
	})
	if err != nil {
		return lms.CourseSynchronization{}, err
	}

	currentByExternalID := make(map[string]lms.ContentItem, len(currentContentItems))
	for _, item := range currentContentItems {
		currentByExternalID[item.ExternalID] = item
	}

	changedContent := make([]lms.ScannableContent, 0, len(externalContent.ContentItems))
	contentToPersist := make([]lms.ContentItem, 0, len(externalContent.ContentItems))
	for _, item := range externalContent.ContentItems {
		hash, err := m.contentHasher.HashContent(item.HTML)
		if err != nil {
			return lms.CourseSynchronization{}, err
		}
		current, exists := currentByExternalID[item.ExternalID]
		contentChangedAt := current.ContentChangedAt
		if !exists || current.ContentHash != hash {
			contentChangedAt = time.Now()
		}
		content := lms.ContentItem{
			ID:               current.ID,
			CourseID:         courseID,
			ExternalID:       item.ExternalID,
			ExternalData:     item.ExternalData,
			ContentHash:      hash,
			ContentChangedAt: contentChangedAt,
		}
		contentToPersist = append(contentToPersist, content)
		if !contentChangedAt.After(changedSince) {
			continue
		}
		changedContent = append(changedContent, lms.ScannableContent{
			ID:           current.ID,
			CourseID:     courseID,
			ExternalID:   item.ExternalID,
			ExternalData: item.ExternalData,
			ContentHash:  hash,
			HTML:         item.HTML,
		})
	}

	if len(contentToPersist) > 0 {
		persistedContent, err := m.integration.CreateManyContentItems(ctx, contentToPersist)
		if err != nil {
			return lms.CourseSynchronization{}, err
		}
		idMap := make(map[string]int64, len(persistedContent))
		for _, item := range persistedContent {
			idMap[item.ExternalID] = item.ID
		}
		for i := range changedContent {
			if id, ok := idMap[changedContent[i].ExternalID]; ok {
				changedContent[i].ID = id
			}
		}
	}

	filesToSync := make([]lms.FileSyncInput, len(externalContent.Files))
	for i, file := range externalContent.Files {
		filesToSync[i] = lms.FileSyncInput{
			FileName:     file.FileName,
			FileType:     file.FileType,
			UpdatedAt:    file.UpdatedAt,
			FileSize:     file.FileSize,
			DownloadURL:  file.DownloadURL,
			ExternalID:   file.ExternalID,
			ExternalData: file.ExternalData,
		}
	}
	if err := m.integration.SyncFilesForCourse(ctx, courseID, filesToSync); err != nil {
		return lms.CourseSynchronization{}, err
	}

	files, err := m.integration.GetFilesByCourse(ctx, courseID)
	if err != nil {
		return lms.CourseSynchronization{}, err
	}

	return lms.CourseSynchronization{
		Course:          course,
		ChangedContents: changedContent,
		Files:           files,
	}, nil
}
