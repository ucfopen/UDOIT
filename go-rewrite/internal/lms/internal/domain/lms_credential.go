package domain

import (
	"time"

	"rewritetest/internal/shared/apperr"
)

type LMSCredential struct {
	userID    int64
	lmsKey    LMSType
	payload   map[string]any
	expiresAt *time.Time
	active    bool
	createdAt time.Time
	updatedAt time.Time
}

func NewLMSCredential(userID int64, lmsKey LMSType, payload map[string]any, expiresAt *time.Time, now time.Time) LMSCredential {
	if payload == nil {
		payload = map[string]any{}
	}

	return LMSCredential{
		userID:    userID,
		lmsKey:    lmsKey,
		payload:   payload,
		expiresAt: expiresAt,
		active:    true,
		createdAt: now,
		updatedAt: now,
	}
}

func RehydrateLMSCredential(userID int64, lmsKey string, payload map[string]any, expiresAt *time.Time, active bool, createdAt, updatedAt time.Time) (LMSCredential, error) {
	if payload == nil {
		payload = map[string]any{}
	}

	lmsKeyEnum := LMSType(lmsKey)
	if !lmsKeyEnum.IsValid() {
		return LMSCredential{}, apperr.New(
			apperr.CodeValidation, "The provided LMS key is not valid",
		)
	}

	return LMSCredential{
		userID:    userID,
		lmsKey:    lmsKeyEnum,
		payload:   payload,
		expiresAt: expiresAt,
		active:    active,
		createdAt: createdAt,
		updatedAt: updatedAt,
	}, nil
}

func (c LMSCredential) UserID() int64           { return c.userID }
func (c LMSCredential) LMSKey() LMSType         { return c.lmsKey }
func (c LMSCredential) Payload() map[string]any { return c.payload }
func (c LMSCredential) ExpiresAt() *time.Time   { return c.expiresAt }
func (c LMSCredential) Active() bool            { return c.active }
