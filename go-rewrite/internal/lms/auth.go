package lms

// Redirect URL probably shouldn't be an explicit field because different kinds
// might not have redirect URLs
//
// This struct acts as a DTO for auth challenges and is functionally separate from
// the auth challenge defined in the domain
type AuthChallenge struct {
	Kind        AuthChallengeKind
	RedirectURL string
}

type AuthChallengeKind string

const (
	AuthChallengeKindRedirect AuthChallengeKind = "redirect"
	AuthChallengeKindNone     AuthChallengeKind = "none"
)
