package domain

import "rewritetest/internal/shared/apperr"

type IssueSeverity string

const (
	IssueSeverityError      IssueSeverity = "error"
	IssueSeverityPotential  IssueSeverity = "potential"
	IssueSeveritySuggestion IssueSeverity = "suggestion"
)

func (s IssueSeverity) String() string {
	return string(s)
}

func (s IssueSeverity) IsValid() bool {
	switch s {
	case IssueSeverityError, IssueSeverityPotential, IssueSeveritySuggestion:
		return true
	default:
		return false
	}
}

func ParseIssueSeverity(s string) (IssueSeverity, error) {
	switch s {
	case "error":
		return IssueSeverityError, nil
	case "potential":
		return IssueSeverityPotential, nil
	case "suggestion":
		return IssueSeveritySuggestion, nil
	default:
		return "", apperr.New(apperr.CodeInternal, "Invalid issue severity '"+s+"'")
	}
}
