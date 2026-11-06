package record

import "time"

type Course struct {
	ID           int64
	Title        string
	TenantID     int64
	IsActive     bool
	IsDirty      bool
	ExternalID   string
	ExternalData map[string]any
	UpdatedAt    time.Time
}
