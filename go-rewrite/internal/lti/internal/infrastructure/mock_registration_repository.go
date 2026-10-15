package infrastructure

import (
	"context"

	"rewritetest/internal/lti/internal/domain"
)

type MockRegistrationRepository struct {
	CreateFunc                 func(ctx context.Context, registration domain.Registration) error
	SaveFunc                   func(ctx context.Context, registration domain.Registration) error
	GetByIssuerAndClientIDFunc func(ctx context.Context, issuer string, clientID string) (*domain.Registration, error)
}

func (m *MockRegistrationRepository) Create(ctx context.Context, registration domain.Registration) error {
	if m.CreateFunc != nil {
		return m.CreateFunc(ctx, registration)
	}

	panic("CreateFunc not implemented")
}

func (m *MockRegistrationRepository) Save(ctx context.Context, registration domain.Registration) error {
	if m.SaveFunc != nil {
		return m.SaveFunc(ctx, registration)
	}

	panic("SaveFunc not implemented")
}

func (m *MockRegistrationRepository) GetByIssuerAndClientID(ctx context.Context, issuer string, clientID string) (*domain.Registration, error) {
	if m.GetByIssuerAndClientIDFunc != nil {
		return m.GetByIssuerAndClientIDFunc(ctx, issuer, clientID)
	}

	panic("GetByIssuerAndClientIDFunc not implemented")
}

var _ domain.RegistrationRepository = (*MockRegistrationRepository)(nil)

// Helper implementations

func NewMapMockRegistrationRepository() *MockRegistrationRepository {
	registrations := map[string]domain.Registration{}

	key := func(issuer string, clientID string) string {
		return issuer + "::" + clientID
	}

	return &MockRegistrationRepository{
		CreateFunc: func(_ context.Context, registration domain.Registration) error {
			registrations[key(registration.Issuer, registration.ClientID)] = registration
			return nil
		},
		SaveFunc: func(_ context.Context, registration domain.Registration) error {
			registrations[key(registration.Issuer, registration.ClientID)] = registration
			return nil
		},
		GetByIssuerAndClientIDFunc: func(_ context.Context, issuer string, clientID string) (*domain.Registration, error) {
			registration, ok := registrations[key(issuer, clientID)]
			if !ok {
				return nil, nil
			}
			return &registration, nil
		},
	}
}
