package domain

import "time"

type LTISession struct {
	state         string
	nonce         string
	issuer        string
	clientID      string
	targetLinkURI string
	tenantID      int64
	createdAt     time.Time
	expiresAt     time.Time
}

func NewLTISession(state, nonce, issuer, clientID, targetLinkURI string, tenantID int64, createdAt, expiresAt time.Time) *LTISession {
	return &LTISession{
		state:         state,
		nonce:         nonce,
		issuer:        issuer,
		clientID:      clientID,
		targetLinkURI: targetLinkURI,
		tenantID:      tenantID,
		createdAt:     createdAt,
		expiresAt:     expiresAt,
	}
}

func (l *LTISession) State() string {
	return l.state
}

func (l *LTISession) Nonce() string {
	return l.nonce
}

func (l *LTISession) Issuer() string {
	return l.issuer
}

func (l *LTISession) ClientID() string {
	return l.clientID
}

func (l *LTISession) IsValidState(state string) bool {
	return l.state == state
}

func (l *LTISession) IsValidNonce(nonce string) bool {
	return l.nonce == nonce
}

func (l *LTISession) TargetLinkURI() string {
	return l.targetLinkURI
}

func (l *LTISession) IsExpired() bool {
	return time.Now().After(l.expiresAt)
}

func (l *LTISession) TenantID() int64 {
	return l.tenantID
}

func (l *LTISession) CreatedAt() time.Time {
	return l.createdAt
}

func (l *LTISession) ExpiresAt() time.Time {
	return l.expiresAt
}
