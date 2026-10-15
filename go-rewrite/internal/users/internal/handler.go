package internal

import (
	"net/http"
	"strconv"

	"rewritetest/internal/shared/apperr"
	"rewritetest/internal/users/internal/application"

	sharedAuth "rewritetest/internal/shared/auth"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	updatePreferencesUseCase *application.UpdatePreferencesUseCase
}

type Authenticator interface {
	WithAuth() gin.HandlerFunc
}

type UpdatePreferencesRequest struct {
	Theme        *string `json:"theme,omitempty"`
	DarkMode     *bool   `json:"darkMode,omitempty"`
	TextSpacing  *int    `json:"textSpacing,omitempty"`
	FontSize     *string `json:"fontSize,omitempty"`
	FontFamily   *string `json:"fontFamily,omitempty"`
	AlertTimeout *int    `json:"alertTimeout,omitempty"`
	Language     *string `json:"lang,omitempty"`
}

func NewHandler(updatePreferencesUseCase *application.UpdatePreferencesUseCase) *Handler {
	return &Handler{
		updatePreferencesUseCase: updatePreferencesUseCase,
	}
}

func (h *Handler) RegisterRoutes(rg *gin.RouterGroup, authenticator Authenticator) {
	rg.Use(authenticator.WithAuth())
	rg.GET("/hello", h.handleHello)
	rg.PATCH("/:userId/preferences", h.handleUpdatePreferences)
	rg.PATCH("/me/preferences", h.handleUpdatePreferencesInferred)
}

func (h *Handler) handleHello(c *gin.Context) {
	c.Error(apperr.New(
		apperr.CodeNotFound, "something went VERY wrong",
		apperr.WithReason("user_not_found"),
		apperr.WithOp("users.handler.handleHello"),
	))

	// fmt.Fprint(w, "hello!")
}

func (h *Handler) handleUpdatePreferences(c *gin.Context) {
	userID, err := strconv.ParseInt(c.Param("userId"), 10, 64)
	if err != nil {
		c.Error(apperr.Validation("The provided user ID is invalid"))
		return
	}

	var updateReq UpdatePreferencesRequest

	if err := c.ShouldBindJSON(&updateReq); err != nil {
		c.Error(apperr.Validation("Failed to parse request body"))
		return
	}

	// Support current "darkMode" field for backwards compatibility, but prefer "theme" if both are provided
	theme := updateReq.Theme
	if theme == nil && updateReq.DarkMode != nil {
		if *updateReq.DarkMode {
			t := "dark"
			theme = &t
		} else {
			t := "light"
			theme = &t
		}
	}

	updatePreferencesCmd := application.UpdatePreferencesCommand{
		UserID:       userID,
		Theme:        theme,
		TextSpacing:  updateReq.TextSpacing,
		FontSize:     updateReq.FontSize,
		FontFamily:   updateReq.FontFamily,
		AlertTimeout: updateReq.AlertTimeout,
		Language:     updateReq.Language,
	}

	principal, ok := sharedAuth.GetPrincipal(c)
	if !ok {
		c.Error(apperr.Unauthorized())
		return
	}

	labels, err := h.updatePreferencesUseCase.Execute(c.Request.Context(), principal, updatePreferencesCmd)
	if err != nil {
		c.Error(err)
		return
	}

	c.JSON(http.StatusOK, map[string]any{
		"user": map[string]any{
			"id":       principal.AgentID,
			"username": "doesn't matter I don't care",
			"name":     "idgaf this shouldn't be returned anyway",
		},
		"labels": labels,
	})
}

func (h *Handler) handleUpdatePreferencesInferred(c *gin.Context) {
	var updateReq UpdatePreferencesRequest

	if err := c.ShouldBindJSON(&updateReq); err != nil {
		c.Error(apperr.Validation("Failed to parse request body"))
		return
	}

	principal, ok := sharedAuth.GetPrincipal(c)
	if !ok {
		c.Error(apperr.Unauthorized())
		return
	}
	userID := principal.AgentID

	theme := updateReq.Theme
	if theme == nil && updateReq.DarkMode != nil {
		if *updateReq.DarkMode {
			t := "dark"
			theme = &t
		} else {
			t := "light"
			theme = &t
		}
	}

	updatePreferencesCmd := application.UpdatePreferencesCommand{
		UserID:       userID,
		Theme:        theme,
		TextSpacing:  updateReq.TextSpacing,
		FontSize:     updateReq.FontSize,
		FontFamily:   updateReq.FontFamily,
		AlertTimeout: updateReq.AlertTimeout,
		Language:     updateReq.Language,
	}

	labels, err := h.updatePreferencesUseCase.Execute(c.Request.Context(), principal, updatePreferencesCmd)
	if err != nil {
		c.Error(err)
		return
	}

	c.JSON(http.StatusOK, map[string]any{
		"labels": labels,
	})
}
