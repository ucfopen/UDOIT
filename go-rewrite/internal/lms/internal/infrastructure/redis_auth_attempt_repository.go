package infrastructure

import (
	"context"
	"encoding/json"
	"time"

	"rewritetest/internal/lms/internal/domain"
	"rewritetest/internal/shared/apperr"

	"github.com/redis/go-redis/v9"
)

type RedisAuthAttemptRepository struct {
	client *redis.Client
	ttl    time.Duration
	prefix string
}

func NewRedisAuthAttemptRepository(client *redis.Client, ttl time.Duration, prefix string) *RedisAuthAttemptRepository {
	return &RedisAuthAttemptRepository{client: client, ttl: ttl, prefix: prefix}
}

func (r *RedisAuthAttemptRepository) Create(ctx context.Context, authAttempt domain.AuthAttempt) error {
	key := r.key(authAttempt.State)
	data, err := json.Marshal(authAttempt)
	if err != nil {
		return err
	}

	err = r.client.Set(ctx, key, data, r.ttl).Err()
	if err != nil {
		return err
	}

	return nil
}

func (r *RedisAuthAttemptRepository) GetByState(ctx context.Context, state string) (domain.AuthAttempt, error) {
	key := r.key(state)
	data, err := r.client.Get(ctx, key).Bytes()
	if err != nil {
		if err == redis.Nil {
			return domain.AuthAttempt{}, nil
		}
		return domain.AuthAttempt{}, err
	}

	var authAttempt domain.AuthAttempt
	err = json.Unmarshal(data, &authAttempt)
	if err != nil {
		return domain.AuthAttempt{}, err
	}

	if authAttempt.ExpiresAt.Before(time.Now()) {
		return domain.AuthAttempt{}, apperr.Internal("The auth attempt has expired")
	}

	return authAttempt, nil
}

func (r *RedisAuthAttemptRepository) key(state string) string {
	return r.prefix + state
}

var _ domain.AuthAttemptRepository = (*RedisAuthAttemptRepository)(nil)
