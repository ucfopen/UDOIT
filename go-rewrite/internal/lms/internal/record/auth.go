package record

import "time"

type AuthAttempt struct {
	UserID        int64
	TenantID      int64
	State         string
	TargetLinkURI string
	CreatedAt     time.Time
	ExpiresAt     time.Time
}

type ProviderConfiguration struct {
	TenantID int64
	LMSKey   string
	Data     map[string]any
}

type LMSCredential struct {
	UserID    int64
	LMSKey    string
	Payload   map[string]any
	ExpiresAt *time.Time
	Active    bool
	CreatedAt time.Time
	UpdatedAt time.Time
}
