package application

import (
	"context"

	"rewritetest/internal/lti/internal/domain"
	"rewritetest/internal/shared/apperr"
	"rewritetest/internal/tenants"

	"github.com/golang-jwt/jwt/v5"
)

type ProcessLaunchUseCase struct {
	ltiSessionRepository    domain.LTISessionRepository
	registrationRepository  domain.RegistrationRepository
	ltiUserLinkRepository   domain.LTIUserLinkRepository
	ltiCourseLinkRepository domain.LTICourseLinkRepository

	tenantRetriever     TenantRetriever
	idTokenVerifier     IDTokenVerifier
	userCreator         UserCreator
	courseCreator       CourseCreator
	courseInfoRetriever CourseInfoRetriever
}

type UserCreator interface {
	CreateUser(ctx context.Context, username string, name string) (int64, error)
}

type CourseCreator interface {
	CreateCourse(ctx context.Context, title string, tenantID int64, externalID string, externalData map[string]any) (int64, error)
}

type TenantRetriever interface {
	GetTenant(ctx context.Context, tenantID int64) (tenants.Tenant, error)
}

type CourseInfoRetriever interface {
	GetCourseInfoFromLTILaunch(ctx context.Context, tenantID int64, claims jwt.MapClaims) (string, map[string]any, error)
}

type ProcessLaunchCommand struct {
	IDToken string
	State   string
}

type ProcessLaunchResult struct {
	TargetLinkURI string
	UserID        int64
	CourseID      int64
	TenantID      int64
}

func NewProcessLaunchUseCase(
	ltiSessionRepository domain.LTISessionRepository,
	registrationRepository domain.RegistrationRepository,
	ltiUserLinkRepository domain.LTIUserLinkRepository,
	ltiCourseLinkRepository domain.LTICourseLinkRepository,

	tenantRetriever TenantRetriever,
	idTokenVerifier IDTokenVerifier,
	userCreator UserCreator,
	courseCreator CourseCreator,
	courseInfoRetriever CourseInfoRetriever,
) *ProcessLaunchUseCase {
	return &ProcessLaunchUseCase{
		ltiSessionRepository:    ltiSessionRepository,
		registrationRepository:  registrationRepository,
		ltiUserLinkRepository:   ltiUserLinkRepository,
		ltiCourseLinkRepository: ltiCourseLinkRepository,

		tenantRetriever:     tenantRetriever,
		idTokenVerifier:     idTokenVerifier,
		userCreator:         userCreator,
		courseCreator:       courseCreator,
		courseInfoRetriever: courseInfoRetriever,
	}
}

func (u *ProcessLaunchUseCase) Execute(ctx context.Context, cmd ProcessLaunchCommand) (ProcessLaunchResult, error) {
	session, err := u.loadSession(ctx, cmd.State)
	if err != nil {
		return ProcessLaunchResult{}, err
	}

	registration, err := u.loadRegistration(ctx, session.Issuer(), session.ClientID())
	if err != nil {
		return ProcessLaunchResult{}, err
	}

	claims, err := u.validateIDToken(ctx, cmd.IDToken, session, registration)
	if err != nil {
		return ProcessLaunchResult{}, err
	}

	tenant, err := u.tenantRetriever.GetTenant(ctx, registration.TenantID)
	if err != nil {
		return ProcessLaunchResult{}, err
	}

	userID, err := u.resolveUser(ctx, claims, session)
	if err != nil {
		return ProcessLaunchResult{}, err
	}

	courseID, err := u.resolveCourse(ctx, claims, tenant)
	if err != nil {
		return ProcessLaunchResult{}, err
	}

	return ProcessLaunchResult{
		TargetLinkURI: session.TargetLinkURI(),
		UserID:        userID,
		CourseID:      courseID,
		TenantID:      session.TenantID(),
	}, nil
}

// `loadSession` retrieves the LTI session from the repository using the provided
// state. It returns an error if the session is not found or has expired.
func (u *ProcessLaunchUseCase) loadSession(ctx context.Context, state string) (*domain.LTISession, error) {
	session, err := u.ltiSessionRepository.GetByState(ctx, state)
	if err != nil {
		return nil, err
	}

	if session == nil || session.IsExpired() {
		return nil, apperr.New(apperr.CodeUnauthorized, "LTI session not found or expired")
	}

	return session, nil
}

// `loadRegistration` retrieves the LTI registration from the repository using the
// provided issuer and client ID. It returns an error if the registration is not found.
func (u *ProcessLaunchUseCase) loadRegistration(ctx context.Context, issuer string, clientID string) (*domain.Registration, error) {
	registration, err := u.registrationRepository.GetByIssuerAndClientID(ctx, issuer, clientID)
	if err != nil {
		return nil, err
	}
	if registration == nil {
		return nil, apperr.New(apperr.CodeNotFound, "LTI registration not found for issuer and client ID")
	}
	return registration, nil
}

// `validateIDToken` validates the provided ID token against the LTI session and
// registration. It checks the token's signature, claims, and ensures that it
// matches the session's expected values. If validation is successful, it returns
// the parsed claims.
func (u *ProcessLaunchUseCase) validateIDToken(ctx context.Context, idToken string, session *domain.LTISession, registration *domain.Registration) (jwt.MapClaims, error) {
	claims, err := u.idTokenVerifier.Verify(ctx, idToken, registration.JWKEndpoint)
	if err != nil {
		if verificationErr, ok := err.(*IDTokenVerificationError); ok {
			switch verificationErr.Code {
			case IDTokenVerificationParseError:
				return nil, apperr.Validation(
					"Failed to parse ID token",
					apperr.WithCause(err),
				)
			case IDTokenVerificationMissingKID:
				return nil, apperr.Validation(
					"ID token missing 'kid' header",
				)
			case IDTokenVerificationJWKSClientError:
				return nil, apperr.Validation(
					"Failed to create JWKS client",
					apperr.WithCause(err),
				)
			case IDTokenVerificationValidationError:
				return nil, apperr.Validation(
					"ID token validation failed",
					apperr.WithCause(err),
				)
			case IDTokenVerificationInvalidClaims:
				return nil, apperr.Validation("Invalid ID token claims")
			}
		}

		return nil, apperr.Internal(
			"ID token validation failed",
			apperr.WithCause(err),
		)
	}

	if err := validateLaunchClaims(claims, session); err != nil {
		return nil, err
	}

	if err := u.ltiSessionRepository.Delete(ctx, session.State()); err != nil {
		return nil, err
	}

	return claims, nil
}

// `resolveUser` checks if a user link exists for the given LTI session and
// claims. If a link exists, it returns the associated user ID. If not, it creates
// a new user and establishes a link between the LTI user and the newly created
// user, returning the new user ID.
func (u *ProcessLaunchUseCase) resolveUser(ctx context.Context, claims jwt.MapClaims, session *domain.LTISession) (int64, error) {
	sub, ok := claims["sub"].(string)
	if !ok || sub == "" {
		return 0, apperr.Validation("ID token missing 'sub' claim")
	}

	userLink, err := u.ltiUserLinkRepository.GetBySubAndIssuer(ctx, sub, session.Issuer())
	if err != nil {
		return 0, err
	}
	if userLink == nil {
		name, ok := claims["name"].(string)
		if !ok || name == "" {
			return 0, apperr.Validation("ID token missing 'name' claim")
		}

		userID, err := u.userCreator.CreateUser(ctx, sub, name)
		if err != nil {
			return 0, err
		}
		userLink = domain.NewLTIUserLink(sub, session.Issuer(), userID)
		if err := u.ltiUserLinkRepository.Create(ctx, userLink); err != nil {
			return 0, err
		}
	}

	return userLink.UserID(), nil
}

// `resolveCourse` checks if a course link exists for the given tenant and
// context. If no link exists, a new course is created. The pair
// (`tenantID`, `contextID`) is assumed to be unique. This is not guaranteed
// in LTI 1.3. However, it is recommended in the spec, and no other
// one-to-one mapping from a set of claims to a course seems to exist.
// https://www.imsglobal.org/spec/lti/v1p3#context-claim
func (u *ProcessLaunchUseCase) resolveCourse(ctx context.Context, claims jwt.MapClaims, tenant tenants.Tenant) (int64, error) {
	contextClaim, ok := claims["https://purl.imsglobal.org/spec/lti/claim/context"].(map[string]any)
	if !ok {
		return 0, apperr.Validation("ID token missing 'context' claim")
	}

	contextID, ok := contextClaim["id"].(string)
	if !ok || contextID == "" {
		return 0, apperr.Validation("ID token context claim missing 'id'")
	}

	courseLink, err := u.ltiCourseLinkRepository.GetByTenantAndContext(ctx, tenant.ID, contextID)
	if err != nil {
		return 0, err
	}
	if courseLink == (domain.LTICourseLink{}) {
		// No course associated with this request was found.
		// Instead of returning an error, we create a new course.

		courseTitle, ok := contextClaim["title"].(string)
		if !ok {
			courseTitle = "Untitled Course"
		}

		externalCourseID, externalCourseInfo, err := u.courseInfoRetriever.GetCourseInfoFromLTILaunch(ctx, tenant.ID, claims)
		if err != nil {
			return 0, err
		}

		courseID, err := u.courseCreator.CreateCourse(ctx, courseTitle, tenant.ID, externalCourseID, externalCourseInfo)
		if err != nil {
			return 0, err
		}

		courseLink = domain.NewLTICourseLink(tenant.ID, contextID, courseID)
		if err = u.ltiCourseLinkRepository.Create(ctx, courseLink); err != nil {
			return 0, err
		}

	}

	return courseLink.CourseID(), nil
}

// `validateLaunchClaims` checks that the claims in the ID token match the
// expected values in the LTI session. It ensures that the `iss`, `nonce`,
// and `aud` claims are consistent with the session.
func validateLaunchClaims(claims jwt.MapClaims, session *domain.LTISession) error {
	if iss, _ := claims["iss"].(string); iss != session.Issuer() {
		return apperr.Validation("ID token 'iss' claim does not match session issuer")
	}

	if nonce, _ := claims["nonce"].(string); nonce != session.Nonce() {
		return apperr.Validation("ID token 'nonce' claim does not match session nonce")
	}

	if targetLinkURI, _ := claims["https://purl.imsglobal.org/spec/lti/claim/target_link_uri"].(string); targetLinkURI != session.TargetLinkURI() {
		return apperr.Validation("ID token 'target_link_uri' claim does not match session target link URI")
	}

	if !audienceContains(claims["aud"], session.ClientID()) {
		return apperr.Validation("ID token 'aud' claim does not contain session client ID")
	}

	return nil
}

func audienceContains(aud any, clientID string) bool {
	switch v := aud.(type) {
	case string:
		return v == clientID
	case []any:
		for _, item := range v {
			if s, ok := item.(string); ok && s == clientID {
				return true
			}
		}
	}
	return false
}
