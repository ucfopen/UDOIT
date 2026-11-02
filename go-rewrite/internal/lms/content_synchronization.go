package lms

import (
	"context"
	"encoding/hex"
	"time"

	"rewritetest/internal/shared/auth"

	"lukechampine.com/blake3"
)

func (m *Module) SynchronizeCourse(ctx context.Context, principal auth.Principal, courseID int64, changedSince time.Time) (CourseSynchronization, error) {
	course, err := m.GetCourse(ctx, courseID)
	if err != nil {
		return CourseSynchronization{}, err
	}
	currentContentItems, err := m.GetContentItemsByCourse(ctx, courseID)
	if err != nil {
		return CourseSynchronization{}, err
	}
	currentByExternalID := make(map[string]ContentItem, len(currentContentItems))
	for _, item := range currentContentItems {
		currentByExternalID[item.ExternalID] = item
	}
	externalContent, err := m.GetCourseContent(ctx, GetCourseContentRequest{
		CourseID: courseID, ExternalCourseID: course.ExternalID, ExternalCourseData: course.ExternalData,
		TenantID: principal.TenantID, UserID: principal.AgentID,
	})
	if err != nil {
		return CourseSynchronization{}, err
	}
	changedContent := make([]ScannableContent, 0, len(externalContent.ContentItems))
	contentToPersist := make([]ContentItem, 0, len(externalContent.ContentItems))
	for _, item := range externalContent.ContentItems {
		contentHash := hashLMSContent(item.HTML)
		current, exists := currentByExternalID[item.ExternalID]
		contentChangedAt := current.ContentChangedAt
		if !exists || current.ContentHash != contentHash {
			contentChangedAt = time.Now()
		}
		contentToPersist = append(contentToPersist, ContentItem{
			ID: current.ID, CourseID: courseID, ExternalID: item.ExternalID, ExternalData: item.ExternalData,
			ContentHash: contentHash, ContentChangedAt: contentChangedAt,
		})
		if !contentChangedAt.After(changedSince) {
			continue
		}
		changedContent = append(changedContent, ScannableContent{
			ID: current.ID, CourseID: courseID, ExternalID: item.ExternalID, ExternalData: item.ExternalData,
			ContentHash: contentHash, HTML: item.HTML,
		})
	}
	if len(contentToPersist) > 0 {
		persistedContent, err := m.CreateManyContentItems(ctx, contentToPersist)
		if err != nil {
			return CourseSynchronization{}, err
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
	filesToSync := make([]FileSyncInput, len(externalContent.Files))
	for i, file := range externalContent.Files {
		filesToSync[i] = FileSyncInput{
			FileName: file.FileName, FileType: file.FileType, UpdatedAt: file.UpdatedAt,
			FileSize: file.FileSize, DownloadURL: file.DownloadURL, ExternalID: file.ExternalID,
			ExternalData: file.ExternalData,
		}
	}
	if err := m.SyncFilesForCourse(ctx, courseID, filesToSync); err != nil {
		return CourseSynchronization{}, err
	}
	files, err := m.GetFilesByCourse(ctx, courseID)
	if err != nil {
		return CourseSynchronization{}, err
	}
	return CourseSynchronization{Course: course, ChangedContents: changedContent, Files: files}, nil
}

func hashLMSContent(content string) string {
	hash := blake3.Sum256([]byte(content))
	return hex.EncodeToString(hash[:])
}
