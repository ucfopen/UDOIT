package domain

import "rewritetest/internal/shared/apperr"

type LMSType string

const (
	LMSTypeCanvas LMSType = "canvas"
	LMSTypeD2L    LMSType = "d2l"
)

func (t LMSType) IsValid() bool {
	switch t {
	case LMSTypeCanvas, LMSTypeD2L:
		return true
	default:
		return false
	}
}

func (t LMSType) String() string {
	return string(t)
}

func ParseLMSType(s string) (LMSType, error) {
	lmsType := LMSType(s)
	if !lmsType.IsValid() {
		return "", apperr.New(apperr.CodeInternal, "The provided LMS type is invalid")
	}
	return lmsType, nil
}
