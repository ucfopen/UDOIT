package domain

type AuthChallenge struct {
	Kind        AuthChallengeKind
	RedirectURL string
}

type AuthChallengeKind string

const (
	AuthChallengeKindRedirect AuthChallengeKind = "redirect"
	AuthChallengeKindNone     AuthChallengeKind = "none"
)
