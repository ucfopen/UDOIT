package canvas

import (
	"context"
	"regexp"
	"strconv"

	"rewritetest/internal/lms/internal/provider"
)

var canvasFileRefPattern = regexp.MustCompile(`/files/(\d+)`)

func (p *Canvas) ResolveFileReferences(_ context.Context, _ provider.Course, refs []provider.Reference, files []provider.File) ([]provider.ResolvedReference, error) {
	fileByCanvasID := make(map[string]string, len(files))
	for _, file := range files {
		if file.ExternalID == "" {
			continue
		}

		fileID, ok := file.ExternalData["file_id"]
		if !ok {
			continue
		}

		canvasFileID, ok := stringifyCanvasID(fileID)
		if !ok || canvasFileID == "" {
			continue
		}

		fileByCanvasID[canvasFileID] = file.ExternalID
	}

	resolved := make([]provider.ResolvedReference, 0)
	seen := make(map[string]struct{})
	for _, ref := range refs {
		matches := canvasFileRefPattern.FindStringSubmatch(ref.Value)
		if len(matches) != 2 {
			continue
		}

		fileExternalID, ok := fileByCanvasID[matches[1]]
		if !ok || fileExternalID == "" {
			continue
		}

		key := ref.ContentExternalID + ":" + fileExternalID
		if _, exists := seen[key]; exists {
			continue
		}
		seen[key] = struct{}{}

		resolved = append(resolved, provider.ResolvedReference{
			ContentExternalID: ref.ContentExternalID,
			FileExternalID:    fileExternalID,
		})
	}

	return resolved, nil
}

func stringifyCanvasID(v any) (string, bool) {
	switch value := v.(type) {
	case string:
		return value, true
	case int:
		return strconv.Itoa(value), true
	case int32:
		return strconv.FormatInt(int64(value), 10), true
	case int64:
		return strconv.FormatInt(value, 10), true
	case float64:
		intValue := int64(value)
		if value != float64(intValue) {
			return "", false
		}
		return strconv.FormatInt(intValue, 10), true
	default:
		return "", false
	}
}
