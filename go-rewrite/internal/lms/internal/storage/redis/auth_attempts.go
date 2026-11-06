package redis

import (
	"context"
	"encoding/json"
	"time"

	"rewritetest/internal/lms/internal/record"
	"rewritetest/internal/shared/apperr"

	redisclient "github.com/redis/go-redis/v9"
)

type AuthAttempts struct {
	client redisclient.UniversalClient
	ttl    time.Duration
	prefix string
}

func NewAuthAttempts(client redisclient.UniversalClient, ttl time.Duration, prefix string) *AuthAttempts {
	return &AuthAttempts{client: client, ttl: ttl, prefix: prefix}
}

func (r *AuthAttempts) Save(ctx context.Context, attempt record.AuthAttempt) error {
	data, err := json.Marshal(attempt)
	if err != nil {
		return err
	}
	return r.client.Set(ctx, r.prefix+attempt.State, data, r.ttl).Err()
}

func (r *AuthAttempts) Get(ctx context.Context, state string) (record.AuthAttempt, bool, error) {
	data, err := r.client.Get(ctx, r.prefix+state).Bytes()
	if err != nil {
		if err == redisclient.Nil {
			return record.AuthAttempt{}, false, nil
		}
		return record.AuthAttempt{}, false, err
	}
	var attempt record.AuthAttempt
	if err := json.Unmarshal(data, &attempt); err != nil {
		return record.AuthAttempt{}, false, err
	}
	if attempt.ExpiresAt.Before(time.Now()) {
		return record.AuthAttempt{}, false, apperr.Internal("The auth attempt has expired")
	}
	return attempt, true, nil
}
