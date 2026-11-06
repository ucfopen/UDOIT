package lms

import (
	"database/sql"
	"encoding/base64"
	"strings"
	"time"

	"rewritetest/internal/lms/internal/provider"
	canvasprovider "rewritetest/internal/lms/internal/provider/canvas"
	"rewritetest/internal/lms/internal/storage/mysql"
	storageRedis "rewritetest/internal/lms/internal/storage/redis"
	"rewritetest/internal/shared/crypto"

	"github.com/redis/go-redis/v9"
)

func New(db *sql.DB, client *redis.Client, baseURL string, encryptionKeyB64 string) (*Service, error) {
	encryptionKey, err := base64.StdEncoding.DecodeString(strings.TrimSpace(encryptionKeyB64))
	if err != nil {
		return nil, err
	}

	keyManager, err := crypto.NewAESKeyManager(encryptionKey)
	if err != nil {
		return nil, err
	}
	store := mysql.New(db, crypto.NewEnvelopeCipher(keyManager, "envelope-v1"))
	authAttempts := storageRedis.NewAuthAttempts(client, time.Hour, "auth_attempt:")
	service, err := NewService(Config{Store: store, AuthAttempts: authAttempts, OAuthRedirectURI: strings.TrimRight(baseURL, "/") + "/oauth/callback", ProviderFactories: map[string]provider.Factory{"canvas": canvasprovider.New}})
	if err != nil {
		return nil, err
	}
	return service, nil
}
