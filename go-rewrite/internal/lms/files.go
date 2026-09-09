package lms

import (
	"context"

	"rewritetest/internal/lms/internal/domain"
	"rewritetest/internal/shared/auth"
)

type DeleteFileRequest struct {
	FileID       int64
	ExternalID   string
	ExternalData map[string]any
}

func (m *Module) DeleteFile(ctx context.Context, principal auth.Principal, req DeleteFileRequest) error {
	lmsProvider, err := m.providerResolver.GetByTenant(ctx, principal.TenantID)
	if err != nil {
		return err
	}

	file := domain.LMSFile{
		ID:           req.FileID,
		ExternalID:   req.ExternalID,
		ExternalData: req.ExternalData,
	}
	err = lmsProvider.DeleteFile(ctx, principal, file)
	if err != nil {
		return err
	}
	return nil
}
