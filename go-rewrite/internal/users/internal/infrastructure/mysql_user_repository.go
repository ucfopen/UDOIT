package infrastructure

import (
	"context"
	"database/sql"
	"encoding/json"

	"rewritetest/internal/shared/apperr"
	"rewritetest/internal/users/internal/domain"
	userssqlc "rewritetest/internal/users/internal/infrastructure/sqlc"
)

type MySQLUserRepository struct {
	queries *userssqlc.Queries
}

func NewMySQLUserRepository(db *sql.DB) *MySQLUserRepository {
	return &MySQLUserRepository{
		queries: userssqlc.New(db),
	}
}

func (r *MySQLUserRepository) GetByID(ctx context.Context, id int64) (*domain.User, error) {
	row, err := r.queries.GetUserByID(ctx, uint64(id))
	if err != nil {
		return nil, err
	}

	prefs := domain.Preferences{}
	if len(row.Preferences) > 0 {
		if err := json.Unmarshal(row.Preferences, &prefs); err != nil {
			return nil, err
		}
	}

	user := domain.RehydrateUser(int64(row.ID), row.Username, row.Name, prefs)

	return &user, nil
}

func (r *MySQLUserRepository) Create(ctx context.Context, user *domain.User) error {
	prefsJSON, err := json.Marshal(user.Preferences())
	if err != nil {
		return err
	}

	var id int64

	result, err := r.queries.CreateUser(
		ctx,
		userssqlc.CreateUserParams{
			Username:    user.Username(),
			Name:        user.Name(),
			Preferences: prefsJSON,
		},
	)
	if err != nil {
		return err
	}

	id, err = result.LastInsertId()
	if err != nil {
		return err
	}

	user.SetID(id)

	return nil
}

func (r *MySQLUserRepository) Update(ctx context.Context, user *domain.User) error {
	prefsJSON, err := json.Marshal(user.Preferences())
	if err != nil {
		return err
	}

	rowsAffected, err := r.queries.UpdateUser(
		ctx,
		userssqlc.UpdateUserParams{
			Username:    user.Username(),
			Name:        user.Name(),
			Preferences: prefsJSON,
			ID:          uint64(user.ID()),
		},
	)
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return apperr.New(apperr.CodeNotFound, "The user to update was not found")
	}

	return nil
}
