package domain

import "time"

type Session struct {
	id        string
	userId    int64
	tenantID  int64
	createdAt time.Time
	expiresAt time.Time
}

func NewSession(id string, userId int64, tenantID int64, createdAt time.Time, expiresAt time.Time) Session {
	return Session{
		id:        id,
		userId:    userId,
		tenantID:  tenantID,
		createdAt: createdAt,
		expiresAt: expiresAt,
	}
}

func (s Session) UserID() int64 {
	return s.userId
}

func (s Session) TenantID() int64 {
	return s.tenantID
}

func (s Session) IsExpired() bool {
	return time.Now().After(s.expiresAt)
}

func (s Session) CreatedAt() time.Time {
	return s.createdAt
}

func (s Session) ExpiresAt() time.Time {
	return s.expiresAt
}

func (s Session) ID() string {
	return s.id
}
