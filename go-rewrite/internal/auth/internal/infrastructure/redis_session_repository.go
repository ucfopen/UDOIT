package infrastructure

import (
	"context"
	"encoding/json"
	"time"

	"rewritetest/internal/auth/internal/domain"

	"github.com/redis/go-redis/v9"
)

type RedisSessionRepository struct {
	client *redis.Client
	ttl    time.Duration
	prefix string
}

func NewRedisSessionRepository(client *redis.Client, ttl time.Duration, prefix string) *RedisSessionRepository {
	return &RedisSessionRepository{
		client: client,
		ttl:    ttl,
		prefix: prefix,
	}
}

func (r *RedisSessionRepository) key(id string) string {
	return r.prefix + id
}

type SessionStorageDTO struct {
	UserID    int64     `json:"user_id"`
	TenantID  int64     `json:"tenant_id"`
	CreatedAt time.Time `json:"created_at"`
	ExpiresAt time.Time `json:"expires_at"`
}

func (r *RedisSessionRepository) Create(ctx context.Context, session domain.Session) error {
	expiration := r.ttl
	if !session.ExpiresAt().IsZero() {
		expiration = time.Until(session.ExpiresAt())
	}

	data, err := json.Marshal(ToSessionStorageDTO(session))
	if err != nil {
		return err
	}

	return r.client.Set(ctx, r.key(session.ID()), data, expiration).Err()
}

func (r *RedisSessionRepository) GetByID(ctx context.Context, id string) (*domain.Session, error) {
	data, err := r.client.Get(ctx, r.key(id)).Bytes()
	if err != nil {
		if err == redis.Nil {
			return nil, nil
		}

		return nil, err
	}

	var dto SessionStorageDTO
	err = json.Unmarshal(data, &dto)
	if err != nil {
		return nil, err
	}

	session := FromSessionStorageDTO(id, dto)
	return &session, nil
}

func (r *RedisSessionRepository) DeleteByID(ctx context.Context, id string) error {
	return r.client.Del(ctx, r.key(id)).Err()
}

func ToSessionStorageDTO(session domain.Session) SessionStorageDTO {
	return SessionStorageDTO{
		UserID:    session.UserID(),
		TenantID:  session.TenantID(),
		CreatedAt: session.CreatedAt(),
		ExpiresAt: session.ExpiresAt(),
	}
}

func FromSessionStorageDTO(id string, dto SessionStorageDTO) domain.Session {
	return domain.NewSession(
		id,
		dto.UserID,
		dto.TenantID,
		dto.CreatedAt,
		dto.ExpiresAt,
	)
}
