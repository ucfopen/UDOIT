package lms

import "context"

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

func (m *Module) BeginAuthentication(ctx context.Context, userID int64, tenantID int64, targetLinkURI string) (AuthChallenge, error) {
	lmsProvider, err := m.providerResolver.GetByTenant(ctx, tenantID)
	if err != nil {
		return AuthChallenge{}, err
	}

	challenge, err := lmsProvider.BeginAuthentication(ctx, userID, targetLinkURI)
	if err != nil {
		return AuthChallenge{}, err
	}
	return AuthChallenge{
		Kind:        AuthChallengeKind(challenge.Kind),
		RedirectURL: challenge.RedirectURL,
	}, nil
}
