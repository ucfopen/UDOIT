package users

import (
	"context"
	"database/sql"

	"rewritetest/internal/users/internal"
	"rewritetest/internal/users/internal/application"
	"rewritetest/internal/users/internal/infrastructure"

	"github.com/gin-gonic/gin"
)

type Module struct {
	handler           *internal.Handler
	i18nService       application.I18NService
	createUserUseCase *application.CreateUserUseCase
	authenticator     internal.Authenticator
}

func New(db *sql.DB, i18nService application.I18NService, authenticator internal.Authenticator) *Module {
	userRepository := infrastructure.NewMySQLUserRepository(db)
	updateUserPreferencesUseCase := application.NewUpdatePreferencesUseCase(userRepository, i18nService)
	createUserUseCase := application.NewCreateUserUseCase(userRepository)
	handler := internal.NewHandler(updateUserPreferencesUseCase)

	return &Module{
		handler:           handler,
		i18nService:       i18nService,
		createUserUseCase: createUserUseCase,
		authenticator:     authenticator,
	}
}

func (m *Module) RegisterRoutes(rg *gin.RouterGroup) {
	m.handler.RegisterRoutes(rg, m.authenticator)
}

func (m *Module) CreateUser(ctx context.Context, username string, name string) (int64, error) {
	user, err := m.createUserUseCase.Execute(ctx, username, name)
	if err != nil {
		return 0, err
	}

	return user.ID(), nil
}
