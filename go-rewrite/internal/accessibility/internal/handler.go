package internal

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"rewritetest/internal/accessibility/internal/application"
	"rewritetest/internal/auth"
	"rewritetest/internal/shared/apperr"
	sharedAuth "rewritetest/internal/shared/auth"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	scanCourseUseCase              *application.ScanCourseUseCase
	createReportUseCase            *application.CreateReportUseCase
	markHtmlAsReviewedUseCase      *application.MarkHtmlAsReviewedUseCase
	markFileAsReviewedUseCase      *application.MarkFileAsReviewedUseCase
	beginFileReplacementUseCase    *application.BeginFileReplacementUseCase
	completeFileReplacementUseCase *application.CompleteFileReplacementUseCase
}

func NewHandler(
	scanCourseUseCase *application.ScanCourseUseCase,
	createReportUseCase *application.CreateReportUseCase,
	markHtmlAsReviewedUseCase *application.MarkHtmlAsReviewedUseCase,
	markFileAsReviewedUseCase *application.MarkFileAsReviewedUseCase,
	beginFileReplacementUseCase *application.BeginFileReplacementUseCase,
	completeFileReplacementUseCase *application.CompleteFileReplacementUseCase,
) *Handler {
	return &Handler{
		scanCourseUseCase:              scanCourseUseCase,
		createReportUseCase:            createReportUseCase,
		markHtmlAsReviewedUseCase:      markHtmlAsReviewedUseCase,
		markFileAsReviewedUseCase:      markFileAsReviewedUseCase,
		beginFileReplacementUseCase:    beginFileReplacementUseCase,
		completeFileReplacementUseCase: completeFileReplacementUseCase,
	}
}

func (h *Handler) RegisterRoutes(rg *gin.RouterGroup, authenticator auth.Authenticator) {
	rg.Use(authenticator.WithAuth())
	rg.POST("/scan/courses/:courseId", h.handleScanCourse)
	rg.PATCH("/mark-reviewed/issues/:id", h.handleMarkHTMLIssueAsReviewed)
	rg.PATCH("/mark-file-reviewed/issues/:id", h.handleMarkFileIssueAsReviewed)
	rg.POST("/file-issues/:id/upload", h.handleBeginFileReplacement)
	rg.POST("/file-issues/:id/upload/complete", h.handleCompleteFileReplacement)
}

type beginFileReplacementRequest struct {
	FileName string `json:"fileName" binding:"required"`
	FileSize int64  `json:"fileSize"`
}

type completeFileReplacementRequest struct {
	UploadSessionID string         `json:"uploadSessionId" binding:"required"`
	UploadResponse  map[string]any `json:"uploadResponse" binding:"required"`
}

type fileUploadInstructionResponse struct {
	UploadSessionID string            `json:"uploadSessionId"`
	Method          string            `json:"method"`
	URL             string            `json:"url"`
	Fields          map[string]string `json:"fields"`
	Headers         map[string]string `json:"headers"`
	ExpiresAt       string            `json:"expiresAt,omitempty"`
}

type fileResponse struct {
	ID           int64          `json:"id"`
	CourseID     int64          `json:"courseId"`
	FileName     string         `json:"fileName"`
	FileType     string         `json:"fileType"`
	UpdatedAt    string         `json:"updatedAt"`
	FileSize     int64          `json:"fileSize"`
	DownloadURL  string         `json:"downloadUrl"`
	ExternalID   string         `json:"externalId"`
	ExternalData map[string]any `json:"externalData"`
}

func (h *Handler) handleBeginFileReplacement(c *gin.Context) {
	principal, ok := sharedAuth.GetPrincipal(c)
	if !ok {
		c.Error(apperr.Unauthorized())
		return
	}

	fileIssueID, err := parseFileIssueID(c)
	if err != nil {
		c.Error(err)
		return
	}

	var request beginFileReplacementRequest
	if err := c.ShouldBindJSON(&request); err != nil || strings.TrimSpace(request.FileName) == "" {
		c.Error(apperr.Validation("A file name is required"))
		return
	}

	result, err := h.beginFileReplacementUseCase.Execute(c.Request.Context(), application.BeginFileReplacementCommand{
		Principal:   principal,
		FileIssueID: fileIssueID,
		NewFileName: request.FileName,
		NewFileSize: request.FileSize,
	})
	if err != nil {
		c.Error(err)
		return
	}

	response := fileUploadInstructionResponse{
		UploadSessionID: result.UploadSessionID,
		Method:          result.Instruction.Method,
		URL:             result.Instruction.URL,
		Fields:          result.Instruction.Fields,
		Headers:         result.Instruction.Headers,
	}
	if !result.Instruction.ExpiresAt.IsZero() {
		response.ExpiresAt = result.Instruction.ExpiresAt.Format(time.RFC3339)
	}

	c.JSON(http.StatusOK, response)
}

func (h *Handler) handleCompleteFileReplacement(c *gin.Context) {
	principal, ok := sharedAuth.GetPrincipal(c)
	if !ok {
		c.Error(apperr.Unauthorized())
		return
	}

	fileIssueID, err := parseFileIssueID(c)
	if err != nil {
		c.Error(err)
		return
	}

	var request completeFileReplacementRequest
	if err := c.ShouldBindJSON(&request); err != nil || strings.TrimSpace(request.UploadSessionID) == "" || len(request.UploadResponse) == 0 {
		c.Error(apperr.Validation("An upload session ID and upload response are required"))
		return
	}

	file, err := h.completeFileReplacementUseCase.Execute(c.Request.Context(), application.CompleteFileReplacementCommand{
		Principal:       principal,
		FileIssueID:     fileIssueID,
		UploadSessionID: request.UploadSessionID,
		UploadResponse:  request.UploadResponse,
	})
	if err != nil {
		c.Error(err)
		return
	}

	c.JSON(http.StatusOK, map[string]any{"file": fileResponse{
		ID:           file.ID,
		CourseID:     file.CourseID,
		FileName:     file.FileName,
		FileType:     file.FileType,
		UpdatedAt:    file.UpdatedAt.Format(time.RFC3339),
		FileSize:     file.FileSize,
		DownloadURL:  file.DownloadURL,
		ExternalID:   file.ExternalID,
		ExternalData: file.ExternalData,
	}})
}

func parseFileIssueID(c *gin.Context) (int64, error) {
	issueIDParam := c.Param("id")
	if issueIDParam == "" {
		return 0, apperr.Validation("File issue ID is required")
	}

	issueID, err := strconv.ParseInt(issueIDParam, 10, 64)
	if err != nil || issueID <= 0 {
		return 0, apperr.Validation("File issue ID must be a valid integer")
	}
	return issueID, nil
}

func (h *Handler) handleScanCourse(c *gin.Context) {
	principal, ok := sharedAuth.GetPrincipal(c)
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
	principal, ok := sharedAuth.GetPrincipal(c)
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
	principal, ok := sharedAuth.GetPrincipal(c)
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
