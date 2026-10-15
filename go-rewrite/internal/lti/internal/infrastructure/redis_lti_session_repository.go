package infrastructure

import (
	"context"
	"encoding/json"
	"time"

	"rewritetest/internal/lti/internal/domain"

	"github.com/redis/go-redis/v9"
)

type RedisLTISessionRepository struct {
	client *redis.Client
	ttl    time.Duration
	prefix string
}

func NewRedisLTISessionRepository(client *redis.Client, ttl time.Duration, prefix string) *RedisLTISessionRepository {
	return &RedisLTISessionRepository{
		client: client,
		ttl:    ttl,
		prefix: prefix,
	}
}

func (r *RedisLTISessionRepository) key(state string) string {
	return r.prefix + state
}

type LTISessionStorageDTO struct {
	State         string    `json:"state"`
	Nonce         string    `json:"nonce"`
	Issuer        string    `json:"issuer"`
	ClientID      string    `json:"client_id"`
	TargetLinkURI string    `json:"target_link_uri"`
	TenantID      int64     `json:"tenant_id"`
	CreatedAt     time.Time `json:"created_at"`
	ExpiresAt     time.Time `json:"expires_at"`
}

func (r *RedisLTISessionRepository) Create(ctx context.Context, session *domain.LTISession) error {
	expiration := r.ttl
	if !session.ExpiresAt().IsZero() {
		expiration = time.Until(session.ExpiresAt())
	}

	data, err := json.Marshal(ToLTISessionStorageDTO(session))
	if err != nil {
		return err
	}

	return r.client.Set(ctx, r.key(session.State()), data, expiration).Err()
}

func (r *RedisLTISessionRepository) GetByState(ctx context.Context, state string) (*domain.LTISession, error) {
	data, err := r.client.Get(ctx, r.key(state)).Bytes()
	if err != nil {
		if err == redis.Nil {
			return nil, nil
		}

		return nil, err
	}

	var dto LTISessionStorageDTO
	err = json.Unmarshal(data, &dto)
	if err != nil {
		return nil, err
	}

	return FromLTISessionStorageDTO(&dto), nil
}

func (r *RedisLTISessionRepository) Delete(ctx context.Context, sessionID string) error {
	return r.client.Del(ctx, r.key(sessionID)).Err()
}

func ToLTISessionStorageDTO(session *domain.LTISession) *LTISessionStorageDTO {
	return &LTISessionStorageDTO{
		State:         session.State(),
		Nonce:         session.Nonce(),
		Issuer:        session.Issuer(),
		ClientID:      session.ClientID(),
		TargetLinkURI: session.TargetLinkURI(),
		TenantID:      session.TenantID(),
		CreatedAt:     session.CreatedAt(),
		ExpiresAt:     session.ExpiresAt(),
	}
}

func FromLTISessionStorageDTO(dto *LTISessionStorageDTO) *domain.LTISession {
	return domain.NewLTISession(
		dto.State,
		dto.Nonce,
		dto.Issuer,
		dto.ClientID,
		dto.TargetLinkURI,
		dto.TenantID,
		dto.CreatedAt,
		dto.ExpiresAt,
	)
}

var _ domain.LTISessionRepository = (*RedisLTISessionRepository)(nil)
