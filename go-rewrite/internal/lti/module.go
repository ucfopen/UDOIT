// Package lti provides the LTI module for handling the LTI launch.
//
// Because a higher level of authentication is typically required than LTI
// launch provides itself, control is deferred to the LMS module at the end of
// the launch for beginning a full authentication process.
package lti

import (
	"context"
	"database/sql"
	"time"

	"rewritetest/internal/lti/internal"
	"rewritetest/internal/lti/internal/application"
	"rewritetest/internal/lti/internal/infrastructure"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

type Module struct {
	handler                     *internal.Handler
	registerRegistrationUseCase *application.RegisterRegistrationUseCase
}

type RegisterRegistrationInput struct {
	Issuer               string
	ClientID             string
	TenantID             int64
	LoginAuthEndpoint    string
	JWKEndpoint          string
	ServiceAuthEndpoint  string
	ServiceLoginEndpoint string
}

func (m *Module) RegisterRoutes(rg *gin.RouterGroup) {
	m.handler.RegisterRoutes(rg)
}

func NewRegistrationModule(db *sql.DB) *Module {
	registrationRepository := infrastructure.NewMySQLRegistrationRepository(db)
	registerRegistrationUseCase := application.NewRegisterRegistrationUseCase(registrationRepository)

	return &Module{registerRegistrationUseCase: registerRegistrationUseCase}
}

func New(
	client *redis.Client,
	db *sql.DB,
	userCreator application.UserCreator,
	sessionCreator internal.SessionCreator,
	courseCreator application.CourseCreator,
	authenticationInitializer application.AuthenticationInitializer,
	tenantRetriever application.TenantRetriever,
	courseInfoRetriever application.CourseInfoRetriever,
	baseURL string,
) *Module {
	ltiSessionTTL := 10 * time.Minute

	ltiSessionRepository := infrastructure.NewRedisLTISessionRepository(client, ltiSessionTTL, "lti_session:")
	registrationRepository := infrastructure.NewMySQLRegistrationRepository(db)
	ltiUserLinkRepository := infrastructure.NewMySQLLTIUserLinkRepository(db)
	ltiCourseLinkRepository := infrastructure.NewMySQLLTICourseLinkRepository(db)
	idTokenVerifier := infrastructure.NewJWKSIDTokenVerifier()

	getLaunchRedirectUseCase := application.NewGetLaunchRedirectUseCase(registrationRepository, ltiSessionRepository)
	processLaunchUseCase := application.NewProcessLaunchUseCase(ltiSessionRepository, registrationRepository, ltiUserLinkRepository, ltiCourseLinkRepository, tenantRetriever, idTokenVerifier, userCreator, courseCreator, courseInfoRetriever)
	registerRegistrationUseCase := application.NewRegisterRegistrationUseCase(registrationRepository)
	beginAuthenticationUseCase := application.NewBeginAuthenticationUseCase(authenticationInitializer)

	handler := internal.NewHandler(
		sessionCreator,
		getLaunchRedirectUseCase,
		processLaunchUseCase,
		beginAuthenticationUseCase,
		baseURL,
	)

	return &Module{
		handler:                     handler,
		registerRegistrationUseCase: registerRegistrationUseCase,
	}
}

func (m *Module) RegisterRegistration(ctx context.Context, input RegisterRegistrationInput) error {
	return m.registerRegistrationUseCase.Execute(ctx, application.RegisterRegistrationCommand{
		Issuer:               input.Issuer,
		ClientID:             input.ClientID,
		TenantID:             input.TenantID,
		LoginAuthEndpoint:    input.LoginAuthEndpoint,
		JWKEndpoint:          input.JWKEndpoint,
		ServiceAuthEndpoint:  input.ServiceAuthEndpoint,
		ServiceLoginEndpoint: input.ServiceLoginEndpoint,
	})
}
