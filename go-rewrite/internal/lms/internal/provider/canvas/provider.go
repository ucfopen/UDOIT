package canvas

import (
	"net/http"

	"rewritetest/internal/lms/internal/provider"
	"rewritetest/internal/shared/apperr"
)

type Canvas struct {
	httpClient   *http.Client
	redirectURI  string
	config       canvasConfig
	credentials  provider.CredentialRepository
	authAttempts provider.AuthAttemptRepository
}

func New(configData map[string]any, redirectURI string, credentials provider.CredentialRepository, authAttempts provider.AuthAttemptRepository) (provider.Provider, error) {
	config, err := asCanvasConfig(configData)
	if err != nil {
		return nil, err
	}
	return &Canvas{httpClient: http.DefaultClient, redirectURI: redirectURI, config: config, credentials: credentials, authAttempts: authAttempts}, nil
}

func (p *Canvas) Type() string { return "canvas" }

func (p *Canvas) ValidateConfiguration(_ map[string]any) error {
	return nil
}

type canvasConfig struct {
	baseURL      string
	clientID     string
	clientSecret string
}

func ValidateConfig(configData map[string]any) error {
	if _, ok := configData["base_url"].(string); !ok {
		return apperr.Validation("Missing or non-string 'base_url' in Canvas provider config")
	}

	if _, ok := configData["client_id"].(string); !ok {
		return apperr.Validation("Missing or non-string 'client_id' in Canvas provider config")
	}

	if _, ok := configData["client_secret"].(string); !ok {
		return apperr.Validation("Missing or non-string 'client_secret' in Canvas provider config")
	}

	return nil
}

func asCanvasConfig(config map[string]any) (canvasConfig, error) {
	baseURL, ok := config["base_url"].(string)
	if !ok {
		return canvasConfig{}, apperr.Internal("Missing or invalid base URL in config data")
	}

	clientID, ok := config["client_id"].(string)
	if !ok {
		return canvasConfig{}, apperr.Internal("Missing or invalid client ID in config data")
	}

	clientSecret, ok := config["client_secret"].(string)
	if !ok {
		return canvasConfig{}, apperr.Internal("Missing or invalid client secret in config data")
	}

	return canvasConfig{
		baseURL:      baseURL,
		clientID:     clientID,
		clientSecret: clientSecret,
	}, nil
}

var _ provider.Provider = (*Canvas)(nil)
