package domain

import (
	"context"
)

type ScanResult struct {
	ContentItemID int64
	ScanRule      ScanRule
	ContentXPath  string
	Severity      IssueSeverity
	Details       map[string]any
}

// ExtractedReference is a reference found in a content item's HTML.
// ContentItemID is the internal ID supplied to the scanner.
type ExtractedReference struct {
	ContentItemID int64
	Kind          string
	TagName       string
	Attribute     string
	Value         string
	XPath         string
}

type ScanContentResult struct {
	Issues     []ScanResult
	References []ExtractedReference
}

type ScanItem struct {
	ContentItemID int64
	HTML          string
	Type          string
}

type Scanner interface {
	ScanContent(ctx context.Context, items []ScanItem) (ScanContentResult, error)
}
