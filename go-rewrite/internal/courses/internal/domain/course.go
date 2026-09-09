package domain

import "time"

type Course struct {
	id           int64
	title        string
	tenantID     int64
	isActive     bool
	isDirty      bool
	externalID   string
	externalData map[string]any
	updatedAt    time.Time
}

func NewCourse(title string, tenantID int64, isActive bool, isDirty bool, externalID string, externalData map[string]any, updatedAt time.Time) *Course {
	return &Course{
		title:        title,
		tenantID:     tenantID,
		isActive:     isActive,
		isDirty:      isDirty,
		externalID:   externalID,
		externalData: externalData,
		updatedAt:    updatedAt,
	}
}

func RehydrateCourse(id int64, title string, tenantID int64, isActive bool, isDirty bool, externalID string, externalData map[string]any, updatedAt time.Time) *Course {
	return &Course{
		id:           id,
		title:        title,
		tenantID:     tenantID,
		isActive:     isActive,
		isDirty:      isDirty,
		externalID:   externalID,
		externalData: externalData,
		updatedAt:    updatedAt,
	}
}

func (c *Course) ID() int64 {
	return c.id
}

func (c *Course) Title() string {
	return c.title
}

func (c *Course) IsActive() bool {
	return c.isActive
}

func (c *Course) TenantID() int64 {
	return c.tenantID
}

func (c *Course) IsDirty() bool {
	return c.isDirty
}

func (c *Course) UpdatedAt() time.Time {
	return c.updatedAt
}

func (c *Course) ExternalID() string {
	return c.externalID
}

func (c *Course) ExternalData() map[string]any {
	return c.externalData
}
