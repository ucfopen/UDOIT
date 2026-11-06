package provider

import (
	"context"

	"rewritetest/internal/lms/internal/record"

	"github.com/golang-jwt/jwt/v5"
)

type CredentialRepository interface {
	ActiveCredential(context.Context, int64) (record.LMSCredential, bool, error)
	SaveCredential(context.Context, record.LMSCredential) error
}

type AuthAttemptRepository interface {
	Save(context.Context, record.AuthAttempt) error
	Get(context.Context, string) (record.AuthAttempt, bool, error)
}

type Provider interface {
	Type() string
	ValidateConfiguration(map[string]any) error
	CourseFromLaunch(jwt.MapClaims) (Course, error)
	GetContent(context.Context, int64, Course, []ContentItem) (ContentSnapshot, error)
	ResolveFileReferences(context.Context, Course, []Reference, []File) ([]ResolvedReference, error)
	BeginFileUpload(context.Context, int64, Course, File, string, int64) (UploadTarget, error)
	CompleteFileUpload(context.Context, int64, Course, File, string, map[string]any) (UploadedFile, error)
	BeginAuthentication(context.Context, int64, int64, string) (AuthChallenge, error)
	CompleteAuthentication(context.Context, record.AuthAttempt, jwt.MapClaims, string) (string, error)
}

type Factory func(configuration map[string]any, redirectURI string, credentials CredentialRepository, authAttempts AuthAttemptRepository) (Provider, error)
