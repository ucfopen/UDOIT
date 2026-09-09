package internal

import (
	"strconv"

	"rewritetest/internal/accessibility/internal/application"
	"rewritetest/internal/shared/apperr"
	"rewritetest/internal/shared/auth"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	scanCourseUseCase   *application.ScanCourseUseCase
	createReportUseCase *application.CreateReportUseCase
}

func NewHandler(scanCourseUseCase *application.ScanCourseUseCase, createReportUseCase *application.CreateReportUseCase) *Handler {
	return &Handler{
		scanCourseUseCase:   scanCourseUseCase,
		createReportUseCase: createReportUseCase,
	}
}

type Authenticator interface {
	WithAuth() gin.HandlerFunc
}

func (h *Handler) RegisterRoutes(rg *gin.RouterGroup, authenticator Authenticator) {
	rg.Use(authenticator.WithAuth())
	rg.POST("/scan/courses/:courseId", h.handleScanCourse)
}

func (h *Handler) handleScanCourse(c *gin.Context) {
	principal, ok := auth.GetPrincipal(c)
	if !ok {
		c.Error(apperr.Unauthorized())
		return
	}

	courseIDParam := c.Param("courseId")
	if courseIDParam == "" {
		c.Error(apperr.Validation("Course ID is required"))
		return
	}
	courseID, err := strconv.ParseInt(courseIDParam, 10, 64)
	if err != nil {
		c.Error(apperr.Validation("Course ID must be a valid integer"))
		return
	}

	err = h.scanCourseUseCase.Execute(c.Request.Context(), principal, courseID)
	if err != nil {
		c.Error(err)
		return
	}

	err = h.createReportUseCase.Execute(c.Request.Context(), application.CreateReportCommand{
		UserID:   principal.AgentID,
		CourseID: courseID,
	})
	if err != nil {
		c.Error(err)
		return
	}

	c.Status(200)
}
