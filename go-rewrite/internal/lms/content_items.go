package lms

import (
	"context"
	"time"

	"rewritetest/internal/lms/internal/record"
)

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

// ContentItem is the persisted representation of a course content item.
type ContentItem struct {
	ID               int64
	ExternalID       string
	ExternalData     map[string]any
	ContentHash      string
	ContentChangedAt time.Time
	CourseID         int64
}

func (s *Service) contentByCourse(ctx context.Context, courseID int64) ([]ContentItem, error) {
	contentItems, err := s.store.ContentByCourse(ctx, courseID)
	if err != nil {
		return nil, err
	}
	result := make([]ContentItem, len(contentItems))
	for i, item := range contentItems {
		result[i] = contentItemFromRecord(item)
	}
	return result, nil
}

// CreateManyContentItems upserts content items and returns their persisted values.
func (s *Service) upsertContentItems(ctx context.Context, contentItems []ContentItem) ([]ContentItem, error) {
	storedContentItems := make([]record.Content, len(contentItems))
	for i, item := range contentItems {
		storedContentItems[i] = record.Content{ID: item.ID, CourseID: item.CourseID, ContentHash: item.ContentHash, ContentChangedAt: item.ContentChangedAt, ExternalID: item.ExternalID, ExternalData: item.ExternalData}
	}
	persisted, err := s.store.UpsertContent(ctx, storedContentItems)
	if err != nil {
		return nil, err
	}
	result := make([]ContentItem, len(persisted))
	for i, item := range persisted {
		result[i] = contentItemFromRecord(item)
	}
	return result, nil
}

func contentItemFromRecord(item record.Content) ContentItem {
	return ContentItem{
		ID: item.ID, ExternalID: item.ExternalID, ExternalData: item.ExternalData,
		ContentHash: item.ContentHash, ContentChangedAt: item.ContentChangedAt, CourseID: item.CourseID,
	}
}
