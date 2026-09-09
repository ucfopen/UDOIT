package domain

type LTIUserLink struct {
	sub    string
	issuer string
	userID int64
}

func NewLTIUserLink(sub, issuer string, userID int64) *LTIUserLink {
	return &LTIUserLink{
		sub:    sub,
		issuer: issuer,
		userID: userID,
	}
}

func (l *LTIUserLink) Sub() string {
	return l.sub
}

func (l *LTIUserLink) Issuer() string {
	return l.issuer
}

func (l *LTIUserLink) UserID() int64 {
	return l.userID
}
