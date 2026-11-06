package lms

import (
	"context"
	"time"

	"rewritetest/internal/lms/internal/provider"
)

type ResolveFileReferencesRequest struct {
	Course         CourseInfo
	References     []ExternalContentReference
	PersistedFiles []ExternalFile
	TenantID       int64
	UserID         int64
}

type CourseInfo struct {
	ID           int64
	ExternalID   string
	ExternalData map[string]any
}

type ExternalContentReference struct {
	ContentExternalID string
	Kind              string
	TagName           string
	Attribute         string
	Value             string
	XPath             string
}

type ExternalFile struct {
	FileName     string
	FileType     string
	UpdatedAt    time.Time
	FileSize     int64
	DownloadURL  string
	ExternalID   string
	ExternalData map[string]any
}

type ResolvedFileReference struct {
	ContentExternalID string
	FileExternalID    string
}

func (m *Service) ResolveFileReferences(ctx context.Context, req ResolveFileReferencesRequest) ([]ResolvedFileReference, error) {
	lmsProvider, err := m.providerForTenant(ctx, req.TenantID)
	if err != nil {
		return nil, err
	}

	references := make([]provider.Reference, len(req.References))
	for i, reference := range req.References {
		references[i] = provider.Reference{
			ContentExternalID: reference.ContentExternalID,
			Kind:              reference.Kind,
			TagName:           reference.TagName,
			Attribute:         reference.Attribute,
			Value:             reference.Value,
			XPath:             reference.XPath,
		}
	}

	files := make([]provider.File, len(req.PersistedFiles))
	for i, file := range req.PersistedFiles {
		files[i] = provider.File{
			FileName:     file.FileName,
			FileType:     file.FileType,
			UpdatedAt:    file.UpdatedAt,
			FileSize:     file.FileSize,
			DownloadURL:  file.DownloadURL,
			ExternalID:   file.ExternalID,
			ExternalData: file.ExternalData,
		}
	}

	resolved, err := lmsProvider.ResolveFileReferences(ctx, provider.Course{ID: req.Course.ID, ExternalID: req.Course.ExternalID, ExternalData: req.Course.ExternalData}, references, files)
	if err != nil {
		return nil, err
	}

	result := make([]ResolvedFileReference, len(resolved))
	for i, reference := range resolved {
		result[i] = ResolvedFileReference{
			ContentExternalID: reference.ContentExternalID,
			FileExternalID:    reference.FileExternalID,
		}
	}

	return result, nil
}
