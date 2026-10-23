package canvas

import (
	"context"
	"log/slog"

	"rewritetest/internal/shared/apperr"

	"github.com/golang-jwt/jwt/v5"
)

type CanvasClaims struct {
	CourseID string `json:"course_id"`
}

func (p *CanvasLMSProvider) GetCourseInfoFromLTILaunch(ctx context.Context, claims jwt.MapClaims) (string, map[string]any, error) {
	customClaims, err := p.asCanvasCustomClaims(claims)
	if err != nil {
		return "", nil, err
	}

	return customClaims.CourseID, map[string]any{
		"course_id": customClaims.CourseID,
	}, nil
}

func (p *CanvasLMSProvider) asCanvasCustomClaims(claims map[string]any) (CanvasClaims, error) {
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
