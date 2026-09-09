package application

import (
	"context"
	"strings"

	"rewritetest/internal/lti/internal/domain"
	"rewritetest/internal/shared/apperr"
)

type RegisterRegistrationUseCase struct {
	registrationRepository domain.RegistrationRepository
}

type RegisterRegistrationCommand struct {
	Issuer               string
	ClientID             string
	TenantID             int64
	LoginAuthEndpoint    string
	JWKEndpoint          string
	ServiceAuthEndpoint  string
	ServiceLoginEndpoint string
}

func NewRegisterRegistrationUseCase(registrationRepository domain.RegistrationRepository) *RegisterRegistrationUseCase {
	return &RegisterRegistrationUseCase{registrationRepository: registrationRepository}
}

func (u *RegisterRegistrationUseCase) Execute(ctx context.Context, cmd RegisterRegistrationCommand) error {
	registration, err := toRegistration(cmd)
	if err != nil {
		return err
	}

	existing, err := u.registrationRepository.GetByIssuerAndClientID(ctx, registration.Issuer, registration.ClientID)
	if err != nil {
		return err
	}

	if existing == nil {
		return u.registrationRepository.Create(ctx, *registration)
	}

	return u.registrationRepository.Save(ctx, *registration)
}

func toRegistration(cmd RegisterRegistrationCommand) (*domain.Registration, error) {
	issuer := strings.TrimSpace(cmd.Issuer)
	clientID := strings.TrimSpace(cmd.ClientID)
	loginAuthEndpoint := strings.TrimSpace(cmd.LoginAuthEndpoint)
	jwkEndpoint := strings.TrimSpace(cmd.JWKEndpoint)
	serviceAuthEndpoint := strings.TrimSpace(cmd.ServiceAuthEndpoint)
	serviceLoginEndpoint := strings.TrimSpace(cmd.ServiceLoginEndpoint)

	if issuer == "" {
		return nil, apperr.Validation("Issuer is required")
	}

	if clientID == "" {
		return nil, apperr.Validation("Client ID is required")
	}

	if cmd.TenantID <= 0 {
		return nil, apperr.Validation("Tenant ID must be greater than zero")
	}

	if loginAuthEndpoint == "" || jwkEndpoint == "" || serviceAuthEndpoint == "" || serviceLoginEndpoint == "" {
		return nil, apperr.Validation("All registration endpoint URLs are required")
	}

	return domain.NewRegistration(
		issuer,
		clientID,
		loginAuthEndpoint,
		jwkEndpoint,
		serviceAuthEndpoint,
		serviceLoginEndpoint,
		cmd.TenantID,
	), nil
}
