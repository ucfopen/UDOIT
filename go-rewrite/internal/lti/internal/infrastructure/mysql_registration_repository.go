package infrastructure

import (
	"context"
	"database/sql"
	"errors"

	"rewritetest/internal/lti/internal/domain"
	ltisqlc "rewritetest/internal/lti/internal/infrastructure/sqlc"
)

type MySQLRegistrationRepository struct {
	queries *ltisqlc.Queries
}

func NewMySQLRegistrationRepository(db *sql.DB) *MySQLRegistrationRepository {
	return &MySQLRegistrationRepository{
		queries: ltisqlc.New(db),
	}
}

func (r *MySQLRegistrationRepository) Create(ctx context.Context, registration domain.Registration) error {
	return r.queries.CreateRegistration(ctx, ltisqlc.CreateRegistrationParams{
		Issuer:               registration.Issuer,
		ClientID:             registration.ClientID,
		TenantID:             uint64(registration.TenantID),
		LoginAuthEndpoint:    registration.LoginAuthEndpoint,
		JwkEndpoint:          registration.JWKEndpoint,
		ServiceAuthEndpoint:  registration.ServiceAuthEndpoint,
		ServiceLoginEndpoint: registration.ServiceLoginEndpoint,
	})
}

func (r *MySQLRegistrationRepository) Save(ctx context.Context, registration domain.Registration) error {
	_, err := r.queries.UpdateRegistration(ctx, ltisqlc.UpdateRegistrationParams{
		TenantID:             uint64(registration.TenantID),
		LoginAuthEndpoint:    registration.LoginAuthEndpoint,
		JwkEndpoint:          registration.JWKEndpoint,
		ServiceAuthEndpoint:  registration.ServiceAuthEndpoint,
		ServiceLoginEndpoint: registration.ServiceLoginEndpoint,
		Issuer:               registration.Issuer,
		ClientID:             registration.ClientID,
	})
	if err != nil {
		return err
	}
	return nil
}

func (r *MySQLRegistrationRepository) GetByIssuerAndClientID(ctx context.Context, issuer string, clientID string) (*domain.Registration, error) {
	row, err := r.queries.GetRegistrationByIssuerAndClientID(ctx, ltisqlc.GetRegistrationByIssuerAndClientIDParams{
		Issuer:   issuer,
		ClientID: clientID,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return domain.NewRegistration(
		row.Issuer,
		row.ClientID,
		row.LoginAuthEndpoint,
		row.JwkEndpoint,
		row.ServiceAuthEndpoint,
		row.ServiceLoginEndpoint,
		int64(row.TenantID),
	), nil
}
