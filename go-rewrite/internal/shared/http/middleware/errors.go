package middleware

import (
	"errors"
	"net/http"

	"rewritetest/internal/shared/apperr"

	"github.com/gin-gonic/gin"
)

type AppHandler func(c *gin.Context) error

type envelope struct {
	Error wireError `json:"error"`
}

type wireError struct {
	Code    string         `json:"code"`
	Reason  string         `json:"reason,omitempty"`
	Message string         `json:"message"`
	Details map[string]any `json:"details,omitempty"`
}

var codeToStatus = map[apperr.Code]int{
	apperr.CodeValidation:         http.StatusBadRequest,
	apperr.CodeNotFound:           http.StatusNotFound,
	apperr.CodeConflict:           http.StatusConflict,
	apperr.CodeUnauthorized:       http.StatusUnauthorized,
	apperr.CodeForbidden:          http.StatusForbidden,
	apperr.CodePreconditionFailed: http.StatusPreconditionFailed,
	apperr.CodeInternal:           http.StatusInternalServerError,
}

func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		if len(c.Errors) > 0 {
			err := c.Errors.Last().Err
			handleError(c, err)
		}
	}
}

func handleError(c *gin.Context, err error) {
	appErr, ok := errors.AsType[*apperr.AppError](err)

	if !ok {
		appErr = apperr.Internal("An unexpected internal error occurred")
	}

	status := codeToStatus[appErr.Code]
	if status == 0 {
		status = http.StatusInternalServerError
	}

	c.JSON(status, envelope{Error: wireError{
		Code:    string(appErr.Code),
		Reason:  appErr.Reason,
		Message: appErr.Message,
		Details: appErr.Details,
	}})
}
