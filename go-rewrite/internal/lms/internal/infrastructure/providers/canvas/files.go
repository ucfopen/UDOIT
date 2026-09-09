package canvas

import (
	"context"
	"fmt"
	"net/http"

	"rewritetest/internal/lms/internal/domain"
	"rewritetest/internal/shared/apperr"
	"rewritetest/internal/shared/auth"
)

type canvasFile struct {
	fileID      string
	contextType string
}

func (p *CanvasLMSProvider) asCanvasFile(file domain.LMSFile) (canvasFile, error) {
	fileID, ok := file.ExternalData["file_id"].(string)
	if !ok {
		return canvasFile{}, apperr.Internal("Missing or invalid file ID in mapping data")
	}

	contextType, ok := file.ExternalData["context_type"].(string)
	if !ok {
		return canvasFile{}, apperr.Internal("Missing or invalid context type in mapping data")
	}

	return canvasFile{
		fileID:      fileID,
		contextType: contextType,
	}, nil
}

// Deletes a file from Canvas
// https://developerdocs.instructure.com/services/canvas/resources/files#method.files.destroy
func (p *CanvasLMSProvider) DeleteFile(ctx context.Context, principal auth.Principal, file domain.LMSFile) error {
	canvasFile, err := p.asCanvasFile(file)
	if err != nil {
		return err
	}

	url := fmt.Sprintf("%s/api/v1/files/%s", p.config.baseURL, canvasFile.fileID)

	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, url, nil)
	if err != nil {
		return apperr.Internal("Failed to create HTTP request")
	}

	req.Header.Set("Accept", "application/json")

	resp, err := p.doAuthenticatedRequest(ctx, CanvasRequest{
		Path:   url,
		Body:   nil,
		Method: http.MethodDelete,
		Config: p.config,
		UserID: principal.AgentID,
	})
	if err != nil {
		return apperr.Internal("Failed to send HTTP request")
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNoContent {
		switch resp.StatusCode {
		case http.StatusUnauthorized:
			return apperr.New(apperr.CodeUnauthorized, "Unauthorized to delete file")
		case http.StatusForbidden:
			return apperr.Forbidden("Forbidden to delete file")
		case http.StatusNotFound:
			return apperr.New(apperr.CodeNotFound, "File not found")
		default:
			return apperr.Internal(fmt.Sprintf("Failed to delete file: Unexpected status code: %d", resp.StatusCode))
		}
	}

	return nil
}
