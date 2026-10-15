package lms

import (
	"context"

	"github.com/golang-jwt/jwt/v5"
)

func (m *Module) GetCourseInfoFromLTILaunch(ctx context.Context, tenantID int64, claims jwt.MapClaims) (string, map[string]any, error) {
	lmsProvider, err := m.providerResolver.GetByTenant(ctx, tenantID)
	if err != nil {
		return "", nil, err
	}

	externalID, externalData, err := lmsProvider.GetCourseInfoFromLTILaunch(ctx, claims)
	if err != nil {
		return "", nil, err
	}

	return externalID, externalData, nil
}
