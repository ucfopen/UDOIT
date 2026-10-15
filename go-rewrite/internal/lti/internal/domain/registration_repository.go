package domain

import "context"

type RegistrationRepository interface {
	Create(ctx context.Context, registration Registration) error
	Save(ctx context.Context, registration Registration) error
	GetByIssuerAndClientID(ctx context.Context, issuer string, clientID string) (*Registration, error)
}
