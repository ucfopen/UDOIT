package canvas

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"strings"

	"rewritetest/internal/shared/apperr"
)

func fetchPaginated[T any](
	p *CanvasLMSProvider,
	ctx context.Context,
	userID int64,
	path string,
	transform func(item T) (T, bool),
) ([]T, error) {
	url := ""
	results := make([]T, 0)

	for url != "" || path != "" {
		resp, err := p.doAuthenticatedRequest(ctx, CanvasRequest{
			Path:   path,
			URL:    url,
			Body:   nil,
			Method: http.MethodGet,
			Config: p.config,
			UserID: userID,
		})
		if err != nil {
			slog.Info("failed to send request", "url", url, "path", path, "error", err)
			return nil, apperr.Internal("Failed to send HTTP request")
		}

		func() {
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusOK {
				err = apperr.Internal("Unexpected status code: " + resp.Status)
				return
			}

			var pageItems []T
			if decodeErr := json.NewDecoder(resp.Body).Decode(&pageItems); decodeErr != nil {
				err = apperr.Internal("Failed to decode response body")
				return
			}

			if transform == nil {
				results = append(results, pageItems...)
			} else {
				for _, item := range pageItems {
					mappedItem, include := transform(item)
					if include {
						results = append(results, mappedItem)
					}
				}
			}

			url = p.getNextPageLink(resp)
			path = ""
		}()
		if err != nil {
			return nil, err
		}
	}

	return results, nil
}

func fetchOne[T any](p *CanvasLMSProvider, ctx context.Context, userID int64, path string) (T, error) {
	var result T

	resp, err := p.doAuthenticatedRequest(ctx, CanvasRequest{
		Path:   path,
		Body:   nil,
		Method: http.MethodGet,
		Config: p.config,
		UserID: userID,
	})
	if err != nil {
		slog.Info("failed to send request", "path", path, "error", err)
		return result, apperr.Internal("Failed to send HTTP request")
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return result, apperr.Internal("Unexpected status code: " + resp.Status)
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return result, apperr.Internal("Failed to decode response body")
	}

	return result, nil
}

// Pagination in Canvas works through a "Link" header.
// https://developerdocs.instructure.com/services/canvas/basics/file.pagination
func (p *CanvasLMSProvider) getNextPageLink(resp *http.Response) string {
	link := resp.Header.Get("Link")

	for part := range strings.SplitSeq(link, ",") {
		if strings.Contains(part, `rel="next"`) {
			start := strings.Index(part, "<")
			end := strings.Index(part, ">")
			if start != -1 && end != -1 && start < end {
				return part[start+1 : end]
			}
		}
	}
	return ""
}
