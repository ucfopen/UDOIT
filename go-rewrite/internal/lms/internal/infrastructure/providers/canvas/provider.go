package canvas

import (
	"net/http"

	"rewritetest/internal/lms/internal/domain"
	"rewritetest/internal/shared/apperr"
)

type CanvasLMSProvider struct {
	lmsCredentialRepository domain.LMSCredentialRepository
	authAttemptRepository   domain.AuthAttemptRepository
	httpClient              *http.Client
	oauthRedirectURI        string
	config                  canvasConfig
}

func NewCanvasLMSProvider(
	lmsCredentialRepository domain.LMSCredentialRepository,
	authAttemptRepository domain.AuthAttemptRepository,
	oauthRedirectURI string,
	config domain.LMSProviderConfig,
) (*CanvasLMSProvider, error) {
	canvasConfig, err := asCanvasConfig(config)
	if err != nil {
		return nil, err
	}

	return &CanvasLMSProvider{
		lmsCredentialRepository: lmsCredentialRepository,
		authAttemptRepository:   authAttemptRepository,
		httpClient:              http.DefaultClient,
		oauthRedirectURI:        oauthRedirectURI,
		config:                  canvasConfig,
	}, nil
}

type canvasConfig struct {
	baseURL      string
	clientID     string
	clientSecret string
	tenantID     int64
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

func asCanvasConfig(config domain.LMSProviderConfig) (canvasConfig, error) {
	baseURL, ok := config.Data()["base_url"].(string)
	if !ok {
		return canvasConfig{}, apperr.Internal("Missing or invalid base URL in config data")
	}

	clientID, ok := config.Data()["client_id"].(string)
	if !ok {
		return canvasConfig{}, apperr.Internal("Missing or invalid client ID in config data")
	}

	clientSecret, ok := config.Data()["client_secret"].(string)
	if !ok {
		return canvasConfig{}, apperr.Internal("Missing or invalid client secret in config data")
	}

	return canvasConfig{
		baseURL:      baseURL,
		clientID:     clientID,
		clientSecret: clientSecret,
		tenantID:     config.TenantID(),
	}, nil
}

var (
	_ domain.FullLMSProvider        = (*CanvasLMSProvider)(nil)
	_ domain.OAuthRedirectProcessor = (*CanvasLMSProvider)(nil)
)
