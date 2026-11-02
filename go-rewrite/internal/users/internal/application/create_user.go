package application

import (
	"context"

	"rewritetest/internal/shared/apperr"
	"rewritetest/internal/users/internal/domain"
)

type CreateUserUseCase struct {
	userRepository domain.UserRepository
}

func NewCreateUserUseCase(userRepository domain.UserRepository) *CreateUserUseCase {
	return &CreateUserUseCase{
		userRepository: userRepository,
	}
}

func (uc *CreateUserUseCase) Execute(ctx context.Context, username string, name string) (domain.User, error) {
	user := domain.NewUser(username, name)
	persistedUser, err := uc.userRepository.Create(ctx, &user)
	if err != nil {
		return domain.User{}, err
	}
	if persistedUser == nil {
		return domain.User{}, apperr.Internal("User repository returned no persisted user")
	}
	return *persistedUser, nil
}
