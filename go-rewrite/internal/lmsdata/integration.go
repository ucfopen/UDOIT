package lmsdata

import (
	"context"
	"time"
)

// LMSIntegration provides the external LMS operations needed to keep the
// server-side course representation current.
type LMSIntegration interface {
	GetCourseContent(ctx context.Context, request GetCourseContentRequest) (ExternalCourseContent, error)
	ResolveFileReferences(ctx context.Context, request ResolveFileReferencesRequest) ([]ResolvedFileReference, error)
}

type GetCourseContentRequest struct {
	CourseID           int64
	ExternalCourseID   string
	ExternalCourseData map[string]any
	TenantID           int64
	UserID             int64
	CurrentContent     []ContentItem
}

type ExternalCourseContent struct {
	ContentItems []ExternalContentItem
	Files        []ExternalFile
}

type ExternalContentItem struct {
	ExternalID   string
	ExternalData map[string]any
	HTML         string
}

type ExternalFile struct {
	FileName     string
	FileType     string
	UpdatedAt    time.Time
	FileSize     int64
	DownloadURL  string
	ExternalID   string
	ExternalData map[string]any
}

type ResolveFileReferencesRequest struct {
	Course         Course
	References     []ExternalContentReference
	PersistedFiles []File
	TenantID       int64
}

type ExternalContentReference struct {
	ContentExternalID string
	Kind              string
	TagName           string
	Attribute         string
	Value             string
	XPath             string
}

type ResolvedFileReference struct {
	ContentExternalID string
	FileExternalID    string
}

type FileReferenceInput struct {
	ContentItemID int64
	Kind          string
	TagName       string
	Attribute     string
	Value         string
	XPath         string
}

type ScannableContent struct {
	ID           int64
	CourseID     int64
	ExternalID   string
	ExternalData map[string]any
	ContentHash  string
	HTML         string
}

type AddFileReferencesRequest struct {
	CourseID       int64
	ContentItemIDs []int64
	References     []FileReferenceInput
}
