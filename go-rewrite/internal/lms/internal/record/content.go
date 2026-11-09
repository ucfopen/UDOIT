package record

import "time"

type Content struct {
	ID               int64
	CourseID         int64
	ContentHash      string
	ContentChangedAt time.Time
	ExternalID       string
	ExternalData     map[string]any
	CreatedAt        time.Time
	UpdatedAt        time.Time
}
