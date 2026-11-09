package domain

import "rewritetest/internal/shared/apperr"

type IssueStatus string

const (
	IssueStatusActive           IssueStatus = "active"
	IssueStatusFixed            IssueStatus = "fixed"
	IssueStatusMarkedAsReviewed IssueStatus = "marked_as_reviewed"
)

func ParseIssueStatus(s string) (IssueStatus, error) {
	switch s {
	case "active":
		return IssueStatusActive, nil
	case "fixed":
		return IssueStatusFixed, nil
	case "marked_as_reviewed":
		return IssueStatusMarkedAsReviewed, nil
	default:
		return "", apperr.New(apperr.CodeInternal, "Invalid issue status '"+s+"'")
	}
}

func (s IssueStatus) String() string {
	return string(s)
}
