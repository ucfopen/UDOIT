package application

import (
	"context"

	"github.com/golang-jwt/jwt/v5"
)

type IDTokenVerifier interface {
	Verify(ctx context.Context, idToken string, jwkEndpoint string) (jwt.MapClaims, error)
}

type IDTokenVerificationErrorCode string

const (
	IDTokenVerificationParseError      IDTokenVerificationErrorCode = "PARSE_ERROR"
	IDTokenVerificationMissingKID      IDTokenVerificationErrorCode = "MISSING_KID"
	IDTokenVerificationJWKSClientError IDTokenVerificationErrorCode = "JWKS_CLIENT_ERROR"
	IDTokenVerificationValidationError IDTokenVerificationErrorCode = "VALIDATION_ERROR"
	IDTokenVerificationInvalidClaims   IDTokenVerificationErrorCode = "INVALID_CLAIMS"
)

type IDTokenVerificationError struct {
	Code  IDTokenVerificationErrorCode
	Cause error
}

func NewIDTokenVerificationError(code IDTokenVerificationErrorCode, cause error) *IDTokenVerificationError {
	return &IDTokenVerificationError{Code: code, Cause: cause}
}

func (e *IDTokenVerificationError) Error() string {
	if e.Cause != nil {
		return string(e.Code) + ": " + e.Cause.Error()
	}
	return string(e.Code)
}

func (e *IDTokenVerificationError) Unwrap() error {
	return e.Cause
}
