package application

import (
	"context"

	"rewritetest/internal/lms"
)

type BeginAuthenticationUseCase struct {
	authenticationInitializer AuthenticationInitializer
}

type BeginAuthenticationRequest struct {
	UserID        int64
	TenantID      int64
	TargetLinkURI string
}

type AuthenticationInitializer interface {
	BeginAuthentication(ctx context.Context, userID int64, tenantID int64, targetLinkURI string) (lms.AuthChallenge, error)
}

func NewBeginAuthenticationUseCase(authenticationInitializer AuthenticationInitializer) *BeginAuthenticationUseCase {
	return &BeginAuthenticationUseCase{
		authenticationInitializer: authenticationInitializer,
	}
}

func (u *BeginAuthenticationUseCase) Execute(ctx context.Context, req BeginAuthenticationRequest) (lms.AuthChallenge, error) {
	return u.authenticationInitializer.BeginAuthentication(ctx, req.UserID, req.TenantID, req.TargetLinkURI)
}
