package domain

import (
	"context"
	"time"

	"rewritetest/internal/shared/auth"

	"github.com/golang-jwt/jwt/v5"
)

// `FullLMSProvider` is split up into multiple smaller interfaces. With the
// current implementation, this doesn't provide any functionality, but it lays
// groundwork for better interface segregation and testing in the future.
type FullLMSProvider interface {
	FileProvider
	AuthenticationProvider
	ScanProvider
	LTIProvider
}

type LMSFile struct {
	ID           int64
	ExternalID   string
	ExternalData map[string]any
}
type FileProvider interface {
	DeleteFile(ctx context.Context, principal auth.Principal, file LMSFile) error
}

type AuthenticationProvider interface {
	BeginAuthentication(ctx context.Context, userID int64, targetLinkURI string) (AuthChallenge, error)
}

type LMSCourse struct {
	ID           int64
	ExternalID   string
	ExternalData map[string]any
}

type LMSContent struct {
	ID           int64
	ExternalID   string
	ExternalData map[string]any
	HTML         string
}
type CourseFile struct {
	FileName     string
	FileType     string
	UpdatedAt    time.Time
	FileSize     int64
	DownloadURL  string
	ExternalID   string
	ExternalData map[string]any
}

type CourseSyncData struct {
	ContentItems []CourseContent
	Files        []CourseFile
}

type ScanProvider interface {
	// The current course content is sent to the LMS provider to allow it to skip
	// fetching content that is already up to date. If new internal content items
	// are created out of the return, the LMS provider expects them to be
	// explicitly registered later.
	GetContent(ctx context.Context, course LMSCourse, currentContent []LMSContent, userID int64) (CourseSyncData, error)
}

type LTIProvider interface {
	GetCourseInfoFromLTILaunch(ctx context.Context, claims jwt.MapClaims) (string, map[string]any, error)
}
