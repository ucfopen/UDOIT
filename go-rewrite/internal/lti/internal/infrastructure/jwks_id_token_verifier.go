package infrastructure

import (
	"context"

	"rewritetest/internal/lti/internal/application"

	"github.com/MicahParks/keyfunc/v3"
	"github.com/golang-jwt/jwt/v5"
)

type JWKSIDTokenVerifier struct{}

func NewJWKSIDTokenVerifier() *JWKSIDTokenVerifier {
	return &JWKSIDTokenVerifier{}
}

func (v *JWKSIDTokenVerifier) Verify(ctx context.Context, idToken string, jwkEndpoint string) (jwt.MapClaims, error) {
	unverified, _, err := jwt.NewParser().ParseUnverified(idToken, jwt.MapClaims{})
	if err != nil {
		return nil, application.NewIDTokenVerificationError(application.IDTokenVerificationParseError, err)
	}

	kid, ok := unverified.Header["kid"].(string)
	if !ok || kid == "" {
		return nil, application.NewIDTokenVerificationError(application.IDTokenVerificationMissingKID, nil)
	}

	k, err := keyfunc.NewDefaultCtx(ctx, []string{jwkEndpoint})
	if err != nil {
		return nil, application.NewIDTokenVerificationError(application.IDTokenVerificationJWKSClientError, err)
	}

	parsed, err := jwt.Parse(idToken, k.Keyfunc, jwt.WithValidMethods([]string{"RS256"}))
	if err != nil || !parsed.Valid {
		return nil, application.NewIDTokenVerificationError(application.IDTokenVerificationValidationError, err)
	}

	claims, ok := parsed.Claims.(jwt.MapClaims)
	if !ok || !parsed.Valid {
		return nil, application.NewIDTokenVerificationError(application.IDTokenVerificationInvalidClaims, nil)
	}

	return claims, nil
}

var _ application.IDTokenVerifier = (*JWKSIDTokenVerifier)(nil)
