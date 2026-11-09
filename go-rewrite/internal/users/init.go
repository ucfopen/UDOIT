package users

import (
	"database/sql"

	"rewritetest/internal/auth"
	"rewritetest/internal/users/internal"
	"rewritetest/internal/users/internal/application"
	"rewritetest/internal/users/internal/infrastructure"

	"github.com/gin-gonic/gin"
)

type Module struct {
	handler           *internal.Handler
	createUserUseCase *application.CreateUserUseCase
	authenticator     auth.Authenticator
}

func New(db *sql.DB, i18nService application.I18NService, authenticator auth.Authenticator) *Module {
	userRepository := infrastructure.NewMySQLUserRepository(db)
	updateUserPreferencesUseCase := application.NewUpdatePreferencesUseCase(userRepository, i18nService)
	createUserUseCase := application.NewCreateUserUseCase(userRepository)
	handler := internal.NewHandler(updateUserPreferencesUseCase)

	return &Module{
		handler:           handler,
		createUserUseCase: createUserUseCase,
		authenticator:     authenticator,
	}
}

func (m *Module) RegisterRoutes(rg *gin.RouterGroup) {
	m.handler.RegisterRoutes(rg, m.authenticator)
}
