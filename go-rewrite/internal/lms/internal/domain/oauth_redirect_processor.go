package domain

import "context"

type OAuthRedirectProcessor interface {
	ProcessOAuthRedirect(ctx context.Context, authAttempt AuthAttempt, code string) (string, error)
}
