package canvas

import (
	"rewritetest/internal/lms/internal/provider"
	"rewritetest/internal/shared/apperr"
)

type canvasCourse struct {
	courseID string
}

func (p *Canvas) asCanvasCourse(course provider.Course) (canvasCourse, error) {
	courseID, ok := course.ExternalData["course_id"].(string)
	if !ok {
		return canvasCourse{}, apperr.Internal("Missing or invalid course ID in course mapping data")
	}

	return canvasCourse{
		courseID: courseID,
	}, nil
}
