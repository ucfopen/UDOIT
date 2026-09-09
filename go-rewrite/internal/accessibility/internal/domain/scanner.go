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

type ScanItem struct {
	ContentItemID int64
	HTML          string
	Type          string
}

type Scanner interface {
	ScanContent(ctx context.Context, items []ScanItem) ([]ScanResult, error)
}
