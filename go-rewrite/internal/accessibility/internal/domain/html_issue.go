package domain

import "time"

type HTMLIssue struct {
	id            int64
	contentItemID int64
	scanRule      ScanRule
	contentXPath  string
	status        IssueStatus
	severity      IssueSeverity
	fixedBy       int64
	fixedAt       time.Time

	// details contains amorphous additional information about the issue
	details map[string]any

	createdAt time.Time
	updatedAt time.Time
}

func NewHTMLIssue(contentItemID int64, scanRule ScanRule, contentXPath string, status IssueStatus, severity IssueSeverity, details map[string]any) *HTMLIssue {
	return &HTMLIssue{
		contentItemID: contentItemID,
		scanRule:      scanRule,
		contentXPath:  contentXPath,
		status:        status,
		severity:      severity,
		details:       details,
		createdAt:     time.Now(),
		updatedAt:     time.Now(),
	}
}

func RehydrateHTMLIssue(
	id int64,
	contentItemID int64,
	scanRule ScanRule,
	contentXPath string,
	status IssueStatus,
	severity IssueSeverity,
	fixedBy int64,
	fixedAt time.Time,
	details map[string]any,
	createdAt time.Time,
	updatedAt time.Time,
) *HTMLIssue {
	return &HTMLIssue{
		id:            id,
		contentItemID: contentItemID,
		scanRule:      scanRule,
		contentXPath:  contentXPath,
		status:        status,
		severity:      severity,
		fixedBy:       fixedBy,
		fixedAt:       fixedAt,
		details:       details,
		createdAt:     createdAt,
		updatedAt:     updatedAt,
	}
}

func (i *HTMLIssue) ID() int64 {
	return i.id
}

func (i *HTMLIssue) ContentItemID() int64 {
	return i.contentItemID
}

func (i *HTMLIssue) ScanRule() ScanRule {
	return i.scanRule
}

func (i *HTMLIssue) ContentXPath() string {
	return i.contentXPath
}

func (i *HTMLIssue) Status() IssueStatus {
	return i.status
}

func (i *HTMLIssue) Severity() IssueSeverity {
	return i.severity
}

func (i *HTMLIssue) FixedBy() int64 {
	return i.fixedBy
}

func (i *HTMLIssue) FixedAt() time.Time {
	return i.fixedAt
}

func (i *HTMLIssue) Details() map[string]any {
	return i.details
}

func (i *HTMLIssue) CreatedAt() time.Time {
	return i.createdAt
}

func (i *HTMLIssue) UpdatedAt() time.Time {
	return i.updatedAt
}
