package infrastructure

import (
	"context"
	"encoding/json"
	"os"
	"path/filepath"

	"rewritetest/internal/i18n/internal/domain"
	"rewritetest/internal/shared/apperr"
)

type FileLabelRepository struct {
	basePath string
}

func NewFileLabelRepository(basePath string) *FileLabelRepository {
	return &FileLabelRepository{basePath: basePath}
}

func (r *FileLabelRepository) GetLabels(ctx context.Context, code string) (domain.Labels, error) {
	filePath := filepath.Join(r.basePath, code+".json")

	content, err := os.ReadFile(filePath)
	if err != nil {
		return nil, apperr.New(apperr.CodeInternal, "The file containing the requested labels was not found.")
	}

	var labels domain.Labels
	if err := json.Unmarshal(content, &labels); err != nil {
		return nil, apperr.New(apperr.CodeInternal, "Failed to parse translation file for language: "+code)
	}

	return labels, nil
}
