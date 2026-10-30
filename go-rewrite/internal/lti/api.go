package lti

import (
	"context"

	"rewritetest/internal/lti/internal/application"
)

type RegisterRegistrationInput struct {
	Issuer               string
	ClientID             string
	TenantID             int64
	LoginAuthEndpoint    string
	JWKEndpoint          string
	ServiceAuthEndpoint  string
	ServiceLoginEndpoint string
}

func (m *Module) RegisterRegistration(ctx context.Context, input RegisterRegistrationInput) error {
	return m.registerRegistrationUseCase.Execute(ctx, application.RegisterRegistrationCommand{
		Issuer:               input.Issuer,
		ClientID:             input.ClientID,
		TenantID:             input.TenantID,
		LoginAuthEndpoint:    input.LoginAuthEndpoint,
		JWKEndpoint:          input.JWKEndpoint,
		ServiceAuthEndpoint:  input.ServiceAuthEndpoint,
		ServiceLoginEndpoint: input.ServiceLoginEndpoint,
	})
}
