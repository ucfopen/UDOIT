package record

import "time"

type FileReference struct {
	ID            int64
	ContentItemID int64
	FileID        int64
	CreatedAt     time.Time
	UpdatedAt     time.Time
}
