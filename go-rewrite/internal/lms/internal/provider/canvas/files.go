package canvas

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"

	"rewritetest/internal/lms/internal/provider"
	"rewritetest/internal/shared/apperr"
)

type canvasFile struct{ fileID string }

func (p *Canvas) BeginFileUpload(ctx context.Context, userID int64, course provider.Course, file provider.File, newFileName string, newFileSize int64) (provider.UploadTarget, error) {
	canvasCourse, err := p.asCanvasCourse(course)
	if err != nil {
		return provider.UploadTarget{}, err
	}
	canvasFile, err := p.asCanvasCourseFile(file)
	if err != nil {
		return provider.UploadTarget{}, err
	}
	folderID, err := p.getFileFolderID(ctx, userID, canvasCourse.courseID, canvasFile.fileID)
	if err != nil {
		return provider.UploadTarget{}, err
	}
	response, err := p.doAuthenticatedRequest(ctx, userID, CanvasRequest{
		Path:   fmt.Sprintf("/api/v1/courses/%s/files", canvasCourse.courseID),
		Query:  url.Values{"name": {newFileName}, "size": {strconv.FormatInt(newFileSize, 10)}, "parent_folder_id": {folderID}},
		Method: http.MethodPost,
	})
	if err != nil {
		return provider.UploadTarget{}, err
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK && response.StatusCode != http.StatusCreated {
		return provider.UploadTarget{}, apperr.Internal(fmt.Sprintf("Failed to create Canvas upload target: unexpected status code: %d", response.StatusCode))
	}
	var target canvasUploadTarget
	if err := json.NewDecoder(response.Body).Decode(&target); err != nil {
		return provider.UploadTarget{}, apperr.Internal("Failed to decode Canvas upload target", apperr.WithCause(err))
	}
	if target.UploadURL == "" {
		return provider.UploadTarget{}, apperr.Internal("Canvas upload target is missing upload URL")
	}
	if len(target.UploadParams) == 0 {
		return provider.UploadTarget{}, apperr.Internal("Canvas upload target is missing upload parameters")
	}
	fields := make(map[string]string, len(target.UploadParams))
	for key, value := range target.UploadParams {
		fields[key] = fmt.Sprint(value)
	}
	return provider.UploadTarget{Method: http.MethodPost, URL: target.UploadURL, Fields: fields, Headers: map[string]string{"Accept": "application/json"}}, nil
}

type canvasFileDetails struct {
	FolderID any `json:"folder_id"`
}
type canvasUploadTarget struct {
	UploadURL    string         `json:"upload_url"`
	UploadParams map[string]any `json:"upload_params"`
}

func (p *Canvas) asCanvasCourseFile(file provider.File) (canvasFile, error) {
	fileID, ok := stringifyCanvasID(file.ExternalData["file_id"])
	if !ok || fileID == "" {
		return canvasFile{}, apperr.Internal("Missing or invalid file ID in mapping data")
	}
	return canvasFile{fileID: fileID}, nil
}

func (p *Canvas) getFileFolderID(ctx context.Context, userID int64, courseID, fileID string) (string, error) {
	response, err := p.doAuthenticatedRequest(ctx, userID, CanvasRequest{Path: "/api/v1/courses/" + courseID + "/files/" + fileID, Method: http.MethodGet})
	if err != nil {
		return "", err
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return "", apperr.Internal(fmt.Sprintf("Failed to get Canvas file: unexpected status code: %d", response.StatusCode))
	}
	var file canvasFileDetails
	if err := json.NewDecoder(response.Body).Decode(&file); err != nil {
		return "", apperr.Internal("Failed to decode Canvas file", apperr.WithCause(err))
	}
	folderID, ok := stringifyCanvasID(file.FolderID)
	if !ok || folderID == "" {
		return "", apperr.Internal("Canvas file is missing a valid folder ID")
	}
	return folderID, nil
}

func (p *Canvas) CompleteFileUpload(ctx context.Context, userID int64, course provider.Course, file provider.File, newFileName string, uploadResponse map[string]any) (provider.UploadedFile, error) {
	canvasCourse, err := p.asCanvasCourse(course)
	if err != nil {
		return provider.UploadedFile{}, err
	}
	if _, err := p.asCanvasCourseFile(file); err != nil {
		return provider.UploadedFile{}, err
	}
	uploadedFileID, ok := stringifyCanvasID(uploadResponse["id"])
	if !ok || uploadedFileID == "" {
		return provider.UploadedFile{}, apperr.Validation("Canvas upload response is missing a valid file ID")
	}
	response, err := p.doAuthenticatedRequest(ctx, userID, CanvasRequest{Path: "/api/v1/courses/" + canvasCourse.courseID + "/files/" + uploadedFileID, Method: http.MethodGet})
	if err != nil {
		return provider.UploadedFile{}, err
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return provider.UploadedFile{}, apperr.Internal(fmt.Sprintf("Failed to get uploaded Canvas file: unexpected status code: %d", response.StatusCode))
	}
	var uploaded CanvasFileResponse
	if err := json.NewDecoder(response.Body).Decode(&uploaded); err != nil {
		return provider.UploadedFile{}, apperr.Internal("Failed to decode uploaded Canvas file", apperr.WithCause(err))
	}
	if uploaded.ID == 0 {
		return provider.UploadedFile{}, apperr.Internal("Uploaded Canvas file is missing an ID")
	}
	if strconv.FormatInt(uploaded.ID, 10) != uploadedFileID {
		return provider.UploadedFile{}, apperr.Validation("Uploaded Canvas file ID does not match the upload response")
	}
	if uploaded.DisplayName == "" {
		return provider.UploadedFile{}, apperr.Internal("Uploaded Canvas file is missing a file name")
	}
	if uploaded.URL == "" {
		return provider.UploadedFile{}, apperr.Internal("Uploaded Canvas file is missing a download URL")
	}
	updatedAt := parseCanvasUpdatedAt(uploaded.UpdatedAt)
	if updatedAt.IsZero() {
		return provider.UploadedFile{}, apperr.Internal("Uploaded Canvas file has an invalid updated timestamp")
	}
	return provider.UploadedFile{FileName: uploaded.DisplayName, FileType: uploaded.MimeClass, UpdatedAt: updatedAt, FileSize: uploaded.Size, DownloadURL: uploaded.URL, ExternalID: "file:" + strconv.FormatInt(uploaded.ID, 10), ExternalData: map[string]any{"file_id": uploaded.ID}}, nil
}

// DeleteFile removes a file from Canvas.
func (p *Canvas) DeleteFile(ctx context.Context, userID int64, file provider.File) error {
	canvasFile, err := p.asCanvasCourseFile(file)
	if err != nil {
		return err
	}
	response, err := p.doAuthenticatedRequest(ctx, userID, CanvasRequest{
		Path:   fmt.Sprintf("/api/v1/files/%s", canvasFile.fileID),
		Method: http.MethodDelete,
	})
	if err != nil {
		return apperr.Internal("Failed to send HTTP request")
	}
	defer response.Body.Close()
	if response.StatusCode == http.StatusOK || response.StatusCode == http.StatusNoContent {
		return nil
	}
	switch response.StatusCode {
	case http.StatusUnauthorized:
		return apperr.New(apperr.CodeUnauthorized, "Unauthorized to delete file")
	case http.StatusForbidden:
		return apperr.Forbidden("Forbidden to delete file")
	case http.StatusNotFound:
		return apperr.New(apperr.CodeNotFound, "File not found")
	default:
		return apperr.Internal(fmt.Sprintf("Failed to delete file: Unexpected status code: %d", response.StatusCode))
	}
}
