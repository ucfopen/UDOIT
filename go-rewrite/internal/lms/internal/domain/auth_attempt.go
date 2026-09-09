package domain

import "time"

type AuthAttempt struct {
	UserID        int64
	TenantID      int64
	State         string
	TargetLinkURI string
	CreatedAt     time.Time
	ExpiresAt     time.Time
}
