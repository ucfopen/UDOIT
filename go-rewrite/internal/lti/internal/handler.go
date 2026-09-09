package internal

import (
	"context"
	"fmt"
	"net/http"

	"rewritetest/internal/auth"
	"rewritetest/internal/lms"
	"rewritetest/internal/lti/internal/application"
	"rewritetest/internal/shared/apperr"

	"github.com/gin-gonic/gin"
)

type SessionCreator interface {
	CreateSession(ctx context.Context, userID int64, tenantID int64) (auth.Session, error)
}

type Handler struct {
	sessionCreator             SessionCreator
	getLaunchRedirectUseCase   *application.GetLaunchRedirectUseCase
	processLaunchUseCase       *application.ProcessLaunchUseCase
	beginAuthenticationUseCase *application.BeginAuthenticationUseCase
	baseURL                    string
}

func NewHandler(sessionCreator SessionCreator, getLaunchRedirectUseCase *application.GetLaunchRedirectUseCase, processLaunchUseCase *application.ProcessLaunchUseCase, beginAuthenticationUseCase *application.BeginAuthenticationUseCase, baseURL string) *Handler {
	return &Handler{
		sessionCreator:             sessionCreator,
		getLaunchRedirectUseCase:   getLaunchRedirectUseCase,
		processLaunchUseCase:       processLaunchUseCase,
		beginAuthenticationUseCase: beginAuthenticationUseCase,
		baseURL:                    baseURL,
	}
}

func (h *Handler) RegisterRoutes(rg *gin.RouterGroup) {
	rg.POST("/authorize", h.handleLoginInitiation)
	rg.POST("/authorize/check", h.handleLaunch)
}

type LoginInitiationRequest struct {
	// From IMS Security Framework 1.0, Section 5.1.1.1
	// https://www.imsglobal.org/spec/security/v1p0/#step-1-third-party-initiated-login
	ISS           string `form:"iss" binding:"required"`
	LoginHint     string `form:"login_hint" binding:"required"`
	TargetLinkURI string `form:"target_link_uri" binding:"required"`

	// From LTI 1.3, Section 4.1
	// https://www.imsglobal.org/spec/lti/v1p3#additional-login-parameters
	ClientID       string `form:"client_id" binding:"required"`
	LTIMessageHint string `form:"lti_message_hint"`
}

// OIDC Login Initiation Request Handler Handles the initial login request from
// the LTI platform and redirects to the launch URL.
//
// The tool must redirect the user agent to the OIDC Authentication endpoint
// registered in the LMS. The redirect can be either a GET or POST. The redirect
// parameters are documented in the launch redirect URL use case.
func (h *Handler) handleLoginInitiation(c *gin.Context) {
	var req LoginInitiationRequest
	if err := c.ShouldBind(&req); err != nil {
		c.Error(apperr.New(apperr.CodeValidation, "Invalid request payload"))
		return
	}

	launchCallbackURL := fmt.Sprintf("%s/lti/authorize/check", h.baseURL)

	getLaunchRedirectQuery := application.GetLaunchRedirectQuery{
		Issuer:         req.ISS,
		LoginHint:      req.LoginHint,
		TargetLinkURI:  req.TargetLinkURI,
		ClientID:       req.ClientID,
		RedirectURI:    launchCallbackURL,
		LTIMessageHint: req.LTIMessageHint,
	}

	redirectURL, err := h.getLaunchRedirectUseCase.Execute(c.Request.Context(), getLaunchRedirectQuery)
	if err != nil {
		c.Error(err)
		return
	}

	c.Redirect(302, redirectURL)
}

// From IMS Security Framework 1.0, Section 5.1.1.3
// https://www.imsglobal.org/spec/security/v1p0/#step-3-authentication-response
type LaunchCallbackRequest struct {
	// IDToken is a signed JWT containing the user identity and LTI message claims
	//
	//
	// REQUIRED claims inside the id_token
	//
	// From IMS Security Framework 1.0, Section 5.1.2
	// https://www.imsglobal.org/spec/security/v1p0/#id-token
	// - iss    Issuer (the platform's identifier)
	// - sub    Subject (the user's unique identifier on the platform)
	// - aud    Audience (this tool's client_id)
	// - exp    Expiration time on or after which the ID Token MUST NOT be accepted for processing
	// - iat    Time at which the JWT was issued
	// - nonce  Must match the value sent in the auth request
	//
	// From LTI 1.3 Specification, Section 5.3
	// https://www.imsglobal.org/spec/lti/v1p3#required-message-claims
	// - https://purl.imsglobal.org/spec/lti/claim/message_type  		Must be "LtiResourceLinkRequest"
	// - https://purl.imsglobal.org/spec/lti/claim/version       		Must be "1.3.0"
	// - https://purl.imsglobal.org/spec/lti/claim/deployment_id  	Identifies the tool deployment within the platform
	// - https://purl.imsglobal.org/spec/lti/claim/target_link_uri  The URL the tool should redirect to after launch
	// - https://purl.imsglobal.org/spec/lti/claim/resource_link  	Contains information about the resource being launched
	//   - id 					Opaque platform-unique identifier for this resource link (required)
	//	 - title 				Descriptive Title (optional)
	//   - description  (optional)
	// https://purl.imsglobal.org/spec/lti/claim/roles Array of LIS role URIs for the launching user (may be empty)
	//
	//
	// OPTIONAL claims inside the id_token
	//
	// From LTI 1.3 Core Specification, Section 5.4
	// https://www.imsglobal.org/spec/lti/v1p3#optional-message-claims
	// - https://purl.imsglobal.org/spec/lti/claim/context 							Course/context info (id, label, title, type)
	// - https://purl.imsglobal.org/spec/lti/claim/tool_platform 				Platform info (guid, name, version, etc.)
	// - https://purl.imsglobal.org/spec/lti/claim/role_scope_mentor 		Mentor role mappings
	// - https://purl.imsglobal.org/spec/lti/claim/launch_presentation 	Presentation hints (locale, target, return URL)
	// - https://purl.imsglobal.org/spec/lti/claim/lis 									LIS person and course data
	// - https://purl.imsglobal.org/spec/lti/claim/custom 							Custom variables defined in the tool placement
	//
	//
	// The tool MUST validate the state parameter, JWT signature, nonce, and
	// expiry before trusting any claims and establishing a user session.
	// See IMS Security Framework 1.0, Section 5.1.3 for validation requirements
	// https://www.imsglobal.org/spec/security/v1p0/#authentication-response-validation
	IDToken string `form:"id_token" binding:"required"`

	// State must match the value sent in the auth request (CSRF protection)
	State string `form:"state" binding:"required"`
}

// Handles the LTI launch request. After the OIDC login initiation redirect, the
// LMS POSTs the authentication response to this endpoint containing the LTI
// message claims.
func (h *Handler) handleLaunch(c *gin.Context) {
	var req LaunchCallbackRequest
	if err := c.ShouldBind(&req); err != nil {
		c.Error(apperr.Validation("Invalid request payload"))
		return
	}

	processLaunchCommand := application.ProcessLaunchCommand{
		IDToken: req.IDToken,
		State:   req.State,
	}

	result, err := h.processLaunchUseCase.Execute(c.Request.Context(), processLaunchCommand)
	if err != nil {
		c.Error(err)
		return
	}

	session, err := h.sessionCreator.CreateSession(c.Request.Context(), result.UserID, result.TenantID)
	if err != nil {
		c.Error(err)
		return
	}

	authChallenge, err := h.beginAuthenticationUseCase.Execute(c.Request.Context(), application.BeginAuthenticationRequest{
		UserID:        result.UserID,
		TenantID:      result.TenantID,
		TargetLinkURI: result.TargetLinkURI,
	})
	if err != nil {
		c.Error(err)
		return
	}

	cookie := &http.Cookie{
		Name:     "AUTH_TOKEN",
		Value:    session.ID,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		Expires:  session.ExpiresAt,
		SameSite: http.SameSiteNoneMode,
	}

	http.SetCookie(c.Writer, cookie)

	switch authChallenge.Kind {
	case lms.AuthChallengeKindRedirect:
		c.Redirect(302, authChallenge.RedirectURL)
		return
	case lms.AuthChallengeKindNone:
		c.Redirect(302, result.TargetLinkURI)
		return
	default:
		c.Error(apperr.Internal("Unknown authentication challenge kind"))
		return
	}
}
