package canvas

import (
	"log/slog"

	"rewritetest/internal/lms/internal/provider"
	"rewritetest/internal/shared/apperr"

	"github.com/golang-jwt/jwt/v5"
)

type CanvasClaims struct {
	CourseID string `json:"course_id"`
}

func (p *Canvas) CourseFromLaunch(claims jwt.MapClaims) (provider.Course, error) {
	customClaims, err := p.asCanvasCustomClaims(claims)
	if err != nil {
		return provider.Course{}, err
	}

	return provider.Course{ExternalID: customClaims.CourseID, ExternalData: map[string]any{"course_id": customClaims.CourseID}}, nil
}

func (p *Canvas) asCanvasCustomClaims(claims map[string]any) (CanvasClaims, error) {
	customClaims, ok := claims["https://purl.imsglobal.org/spec/lti/claim/custom"].(map[string]any)
	if !ok {
		return CanvasClaims{}, apperr.Internal("Missing or invalid custom claims in LTI launch")
	}

	slog.Info("These are the custom claims", "customClaims", customClaims)

	lmsCourseID, ok := customClaims["course_id"].(string)
	if !ok {
		return CanvasClaims{}, apperr.Internal("Missing or invalid course ID in custom claims")
	}

	return CanvasClaims{
		CourseID: lmsCourseID,
	}, nil
}
