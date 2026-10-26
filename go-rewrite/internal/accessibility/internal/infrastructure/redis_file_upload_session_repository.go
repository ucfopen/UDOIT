package infrastructure

import (
	"context"
	"encoding/json"
	"time"

	"rewritetest/internal/accessibility/internal/application"

	"github.com/redis/go-redis/v9"
)

type RedisFileUploadSessionRepository struct {
	client *redis.Client
	ttl    time.Duration
	prefix string
}

func NewRedisFileUploadSessionRepository(client *redis.Client, ttl time.Duration, prefix string) *RedisFileUploadSessionRepository {
	return &RedisFileUploadSessionRepository{
		client: client,
		ttl:    ttl,
		prefix: prefix,
	}
}

func (r *RedisFileUploadSessionRepository) key(id string) string {
	return r.prefix + id
}

func (r *RedisFileUploadSessionRepository) Create(ctx context.Context, session application.FileUploadSession) error {
	data, err := json.Marshal(session)
	if err != nil {
		return err
	}

	expiration := r.ttl
	if !session.ExpiresAt.IsZero() {
		expiration = time.Until(session.ExpiresAt)
	}

	return r.client.Set(ctx, r.key(session.ID), data, expiration).Err()
}

func (r *RedisFileUploadSessionRepository) GetByID(ctx context.Context, id string) (*application.FileUploadSession, error) {
	data, err := r.client.Get(ctx, r.key(id)).Bytes()
	if err != nil {
		if err == redis.Nil {
			return nil, nil
		}
		return nil, err
	}

	var session application.FileUploadSession
	if err := json.Unmarshal(data, &session); err != nil {
		return nil, err
	}

	if !session.ExpiresAt.IsZero() && session.ExpiresAt.Before(time.Now()) {
		return nil, nil
	}

	return &session, nil
}

func (r *RedisFileUploadSessionRepository) DeleteByID(ctx context.Context, id string) error {
	return r.client.Del(ctx, r.key(id)).Err()
}

var _ application.FileUploadSessionRepository = (*RedisFileUploadSessionRepository)(nil)
