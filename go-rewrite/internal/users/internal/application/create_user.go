package application

import (
	"context"

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
	err := uc.userRepository.Create(ctx, &user)
	if err != nil {
		return domain.User{}, err
	}
	return user, nil
}
