package provider

import "time"

type Course struct {
	ID           int64
	ExternalID   string
	ExternalData map[string]any
}

type ContentItem struct {
	ID           int64
	ExternalID   string
	ExternalData map[string]any
}

type ContentSnapshot struct {
	ContentItems []Content
	Files        []File
}

type Content struct {
	ExternalID   string
	ExternalData map[string]any
	HTML         string
}

type File struct {
	FileName     string
	FileType     string
	UpdatedAt    time.Time
	FileSize     int64
	DownloadURL  string
	ExternalID   string
	ExternalData map[string]any
}

type Reference struct {
	ContentExternalID string
	Kind              string
	TagName           string
	Attribute         string
	Value             string
	XPath             string
}

type ResolvedReference struct {
	ContentExternalID string
	FileExternalID    string
}

type UploadTarget struct {
	Method    string
	URL       string
	Fields    map[string]string
	Headers   map[string]string
	ExpiresAt time.Time
}

type UploadedFile struct {
	FileName     string
	FileType     string
	UpdatedAt    time.Time
	FileSize     int64
	DownloadURL  string
	ExternalID   string
	ExternalData map[string]any
}

type AuthChallenge struct {
	Kind        string
	RedirectURL string
}
