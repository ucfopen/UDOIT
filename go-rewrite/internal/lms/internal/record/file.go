package record

import "time"

type File struct {
	ID            int64
	CourseID      int64
	IsReplacement bool
	FileName      string
	FileType      string
	UpdatedAt     time.Time
	FileSize      int64
	DownloadURL   string
	ExternalID    string
	ExternalData  map[string]any
}

type FileSync struct {
	IsReplacement bool
	FileName      string
	FileType      string
	UpdatedAt     time.Time
	FileSize      int64
	DownloadURL   string
	ExternalID    string
	ExternalData  map[string]any
}
