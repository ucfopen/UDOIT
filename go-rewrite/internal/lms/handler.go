package lms

import (
	"rewritetest/internal/shared/apperr"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

func (s *Service) RegisterRoutes(rg *gin.RouterGroup) {
	NewHandler(s).RegisterRoutes(rg)
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) RegisterRoutes(rg *gin.RouterGroup) {
	rg.GET("/oauth/callback", h.handleOAuthRedirect)
}

type OAuthRedirectRequest struct {
	Code  string `form:"code"`
	State string `form:"state"`
}

func (h *Handler) handleOAuthRedirect(c *gin.Context) {
	var req OAuthRedirectRequest
	if err := c.ShouldBind(&req); err != nil {
		c.Error(apperr.Validation("The OAuth redirect request format is not valid"))
		return
	}

	redirectURL, err := h.service.ProcessOAuthRedirect(c.Request.Context(), req.State, nil, req.Code)
	if err != nil {
		c.Error(err)
		return
	}

	c.Redirect(302, redirectURL)
}
