package lmsdata

import (
	"context"
	"time"

	"rewritetest/internal/lms"
	coursesapplication "rewritetest/internal/lmsdata/internal/courses/application"
	"rewritetest/internal/shared/apperr"
	"rewritetest/internal/shared/auth"
)

type CourseContentRetriever interface {
	GetCourseContent(ctx context.Context, req lms.GetCourseContentRequest) (lms.ExternalCourseContent, error)
}

type CourseSynchronization struct {
	Course          Course
	ChangedContents []ScannableContent
	Files           []File
}

type ScannableContent struct {
	ID           int64
	CourseID     int64
	ExternalID   string
	ExternalData map[string]any
	ContentHash  string
	HTML         string
}

func (m *Module) SynchronizeCourse(ctx context.Context, principal auth.Principal, courseID int64, changedSince time.Time) (CourseSynchronization, error) {
	course, err := m.GetCourse(ctx, courseID)
	if err != nil {
		return CourseSynchronization{}, err
	}

	currentContentItems, err := m.GetContentItemsByCourse(ctx, courseID)
	if err != nil {
		return CourseSynchronization{}, err
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
		return CourseSynchronization{}, err
	}

	currentByExternalID := make(map[string]ContentItem, len(currentContentItems))
	for _, item := range currentContentItems {
		currentByExternalID[item.ExternalID] = item
	}

	changedContent := make([]ScannableContent, 0, len(externalContent.ContentItems))
	contentToPersist := make([]ContentItem, 0, len(externalContent.ContentItems))
	for _, item := range externalContent.ContentItems {
		hash, err := m.contentHasher.HashContent(item.HTML)
		if err != nil {
			return CourseSynchronization{}, err
		}
		current, exists := currentByExternalID[item.ExternalID]
		contentChangedAt := current.ContentChangedAt
		if !exists || current.ContentHash != hash {
			contentChangedAt = time.Now()
		}
		content := ContentItem{
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
		changedContent = append(changedContent, ScannableContent{
			ID:           current.ID,
			CourseID:     courseID,
			ExternalID:   item.ExternalID,
			ExternalData: item.ExternalData,
			ContentHash:  hash,
			HTML:         item.HTML,
		})
	}

	if len(contentToPersist) > 0 {
		idMap, err := m.CreateManyContentItems(ctx, contentToPersist)
		if err != nil {
			return CourseSynchronization{}, err
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
			FileName:     file.FileName,
			FileType:     file.FileType,
			UpdatedAt:    file.UpdatedAt,
			FileSize:     file.FileSize,
			DownloadURL:  file.DownloadURL,
			ExternalID:   file.ExternalID,
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

	return CourseSynchronization{
		Course:          course,
		ChangedContents: changedContent,
		Files:           files,
	}, nil
}

func (m *Module) CreateCourse(ctx context.Context, title string, tenantID int64, externalID string, externalData map[string]any) (int64, error) {
	return m.createCourseUseCase.Execute(ctx, coursesapplication.CreateCourseCommand{
		Title:        title,
		TenantID:     tenantID,
		ExternalID:   externalID,
		ExternalData: externalData,
	})
}

type Course struct {
	ID           int64
	TenantID     int64
	ExternalID   string
	ExternalData map[string]any
}

func (m *Module) GetCourse(ctx context.Context, courseID int64) (Course, error) {
	course, err := m.courseRepository.GetByID(ctx, courseID)
	if err != nil {
		return Course{}, err
	}
	if course == nil {
		return Course{}, apperr.New(apperr.CodeInternal, "The requested course was not found.")
	}

	return Course{
		ID:           course.ID(),
		TenantID:     course.TenantID(),
		ExternalID:   course.ExternalID(),
		ExternalData: course.ExternalData(),
	}, nil
}
