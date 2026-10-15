package internal

import (
	"strconv"

	"rewritetest/internal/accessibility/internal/application"
	"rewritetest/internal/shared/apperr"
	"rewritetest/internal/shared/auth"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	scanCourseUseCase         *application.ScanCourseUseCase
	createReportUseCase       *application.CreateReportUseCase
	markHtmlAsReviewedUseCase *application.MarkHtmlAsReviewedUseCase
	markFileAsReviewedUseCase *application.MarkFileAsReviewedUseCase
}

func NewHandler(
	scanCourseUseCase *application.ScanCourseUseCase,
	createReportUseCase *application.CreateReportUseCase,
	markHtmlAsReviewedUseCase *application.MarkHtmlAsReviewedUseCase,
	markFileAsReviewedUseCase *application.MarkFileAsReviewedUseCase,
) *Handler {
	return &Handler{
		scanCourseUseCase:         scanCourseUseCase,
		createReportUseCase:       createReportUseCase,
		markHtmlAsReviewedUseCase: markHtmlAsReviewedUseCase,
		markFileAsReviewedUseCase: markFileAsReviewedUseCase,
	}
}

type Authenticator interface {
	WithAuth() gin.HandlerFunc
}

func (h *Handler) RegisterRoutes(rg *gin.RouterGroup, authenticator Authenticator) {
	rg.Use(authenticator.WithAuth())
	rg.POST("/scan/courses/:courseId", h.handleScanCourse)
	rg.PATCH("/mark-reviewed/issues/:id", h.handleMarkHTMLIssueAsReviewed)
	rg.PATCH("/mark-file-reviewed/issues/:id", h.handleMarkFileIssueAsReviewed)
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

func (h *Handler) handleMarkHTMLIssueAsReviewed(c *gin.Context) {

	principal, ok := auth.GetPrincipal(c)
	if !ok {
		c.Error(apperr.Unauthorized())
		return
	}
	issueIDParam := c.Param("id")
	if issueIDParam == "" {
		c.Error(apperr.Validation("issue ID is required"))
		return
	}
	issueID, err := strconv.ParseInt(issueIDParam, 10, 64)
	if err != nil {
		c.Error(apperr.Validation("issue id must be a valid number"))
		return
	}

	err = h.markHtmlAsReviewedUseCase.Execute(c.Request.Context(), application.MarkHTMLReviewedCommand{
		UserID:  principal.AgentID,
		IssueID: issueID,
	})
	if err != nil {
		c.Error(err)
		return
	}

	c.Status(200)
}

func (h *Handler) handleMarkFileIssueAsReviewed(c *gin.Context) {

	principal, ok := auth.GetPrincipal(c)
	if !ok {
		c.Error(apperr.Unauthorized())
		return
	}
	fileIssueIDParam := c.Param("id")
	if fileIssueIDParam == "" {
		c.Error(apperr.Validation("file issue ID is required"))
		return
	}

	fileIssueID, err := strconv.ParseInt(fileIssueIDParam, 10, 64)
	if err != nil {
		c.Error(apperr.Validation("File issue id must be a valid number"))
		return
	}

	err = h.markFileAsReviewedUseCase.Execute(c.Request.Context(), application.MarkFileReviewedCommand{
		UserID:      principal.AgentID,
		FileIssueID: fileIssueID,
	})
	if err != nil {
		c.Error(err)
		return
	}

	c.Status(200) // OK
}
