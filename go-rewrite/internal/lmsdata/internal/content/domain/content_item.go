package domain

import "time"

type ContentItem struct {
	id               int64
	courseID         int64
	contentHash      string
	contentChangedAt time.Time
	externalID       string
	externalData     map[string]any
	createdAt        time.Time
	updatedAt        time.Time
}

func NewContentItem(courseID int64, contentHash string, externalID string, externalData map[string]any, contentChangedAt time.Time) *ContentItem {
	return &ContentItem{
		courseID:         courseID,
		contentHash:      contentHash,
		contentChangedAt: contentChangedAt,
		externalID:       externalID,
		externalData:     externalData,
		createdAt:        time.Now(),
		updatedAt:        time.Now(),
	}
}

func RehydrateContentItem(id int64, courseID int64, contentHash string, externalID string, externalData map[string]any, contentChangedAt time.Time, createdAt time.Time, updatedAt time.Time) *ContentItem {
	return &ContentItem{
		id:               id,
		courseID:         courseID,
		contentHash:      contentHash,
		contentChangedAt: contentChangedAt,
		externalID:       externalID,
		externalData:     externalData,
		createdAt:        createdAt,
		updatedAt:        updatedAt,
	}
}

func (c *ContentItem) ID() int64 {
	return c.id
}

func (c *ContentItem) CourseID() int64 {
	return c.courseID
}

func (c *ContentItem) CreatedAt() time.Time {
	return c.createdAt
}

func (c *ContentItem) UpdatedAt() time.Time {
	return c.updatedAt
}

func (c *ContentItem) ContentHash() string {
	return c.contentHash
}

func (c *ContentItem) ContentChangedAt() time.Time {
	return c.contentChangedAt
}

func (c *ContentItem) ExternalID() string {
	return c.externalID
}

func (c *ContentItem) ExternalData() map[string]any {
	return c.externalData
}
