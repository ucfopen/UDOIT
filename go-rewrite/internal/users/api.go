package users

import (
	"context"
)

func (m *Module) CreateUser(ctx context.Context, username string, name string) (int64, error) {
	user, err := m.createUserUseCase.Execute(ctx, username, name)
	if err != nil {
		return 0, err
	}

	return user.ID(), nil
}
