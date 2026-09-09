package internal

import (
	"strconv"

	"rewritetest/internal/files/internal/application"
	"rewritetest/internal/shared/apperr"
	"rewritetest/internal/shared/auth"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	getFileUseCase    *application.GetFileUseCase
	deleteFileUseCase *application.DeleteFileUseCase
}

func NewHandler(getFileUseCase *application.GetFileUseCase, deleteFileUseCase *application.DeleteFileUseCase) *Handler {
	return &Handler{
		getFileUseCase:    getFileUseCase,
		deleteFileUseCase: deleteFileUseCase,
	}
}

func (h *Handler) RegisterRoutes(rg *gin.RouterGroup) {
	rg.GET("/:file/review", h.HandleReviewFile)
	rg.GET("/hello", h.HandleHelloFiles)
	rg.DELETE("/:file", h.HandleDeleteFile)
}

func (h *Handler) HandleHelloFiles(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "Hello, Files!",
	})
}

func (h *Handler) HandleReviewFile(c *gin.Context) {
	fileID, err := strconv.ParseInt(c.Param("file"), 10, 64)
	if err != nil {
		c.Error(apperr.New(
			apperr.CodeValidation, "File ID must be a valid integer",
			apperr.WithCause(err),
		))
		return
	}

	_, err = h.getFileUseCase.Execute(c.Request.Context(), fileID)
	if err != nil {
		c.Error(err)
		return
	}
}

func (h *Handler) HandleDeleteFile(c *gin.Context) {
	principal, ok := auth.GetPrincipal(c)
	if !ok {
		c.Error(apperr.Unauthorized())
		return
	}

	fileID, err := strconv.ParseInt(c.Param("file"), 10, 64)
	if err != nil {
		c.Error(apperr.New(
			apperr.CodeValidation, "File ID must be a valid integer",
			apperr.WithCause(err),
		))
		return
	}

	err = h.deleteFileUseCase.Execute(c.Request.Context(), principal, fileID)
	if err != nil {
		c.Error(err)
		return
	}

	c.JSON(200, gin.H{
		"message": "File deleted successfully",
	})
}
