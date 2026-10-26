package canvas

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"

	"rewritetest/internal/lms/internal/domain"
	"rewritetest/internal/shared/apperr"
	"rewritetest/internal/shared/auth"
)

type canvasFile struct {
	fileID string
}

func (p *CanvasLMSProvider) BeginFileUpload(
	ctx context.Context,
	principal auth.Principal,
	course domain.LMSCourse,
	file domain.CourseFile,
	newFileName string,
	newFileSize int64,
) (domain.FileUploadTarget, error) {
	canvasCourse, err := p.asCanvasCourse(course)
	if err != nil {
		return domain.FileUploadTarget{}, err
	}
	canvasFile, err := p.asCanvasCourseFile(file)
	if err != nil {
		return domain.FileUploadTarget{}, err
	}

	folderID, err := p.getFileFolderID(ctx, principal.AgentID, canvasCourse.courseID, canvasFile.fileID)
	if err != nil {
		return domain.FileUploadTarget{}, err
	}

	response, err := p.doAuthenticatedRequest(ctx, CanvasRequest{
		Path: fmt.Sprintf("/api/v1/courses/%s/files", canvasCourse.courseID),
		Query: url.Values{
			"name":             {newFileName},
			"size":             {strconv.FormatInt(newFileSize, 10)},
			"parent_folder_id": {folderID},
		},
		Method: http.MethodPost,
		Config: p.config,
		UserID: principal.AgentID,
	})
	if err != nil {
		return domain.FileUploadTarget{}, err
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK && response.StatusCode != http.StatusCreated {
		return domain.FileUploadTarget{}, apperr.Internal(fmt.Sprintf("Failed to create Canvas upload target: unexpected status code: %d", response.StatusCode))
	}

	var uploadTarget canvasUploadTarget
	if err := json.NewDecoder(response.Body).Decode(&uploadTarget); err != nil {
		return domain.FileUploadTarget{}, apperr.Internal("Failed to decode Canvas upload target", apperr.WithCause(err))
	}
	if uploadTarget.UploadURL == "" {
		return domain.FileUploadTarget{}, apperr.Internal("Canvas upload target is missing upload URL")
	}
	if len(uploadTarget.UploadParams) == 0 {
		return domain.FileUploadTarget{}, apperr.Internal("Canvas upload target is missing upload parameters")
	}

	fields := make(map[string]string, len(uploadTarget.UploadParams))
	for key, value := range uploadTarget.UploadParams {
		fields[key] = fmt.Sprint(value)
	}

	return domain.FileUploadTarget{
		Method: http.MethodPost,
		URL:    uploadTarget.UploadURL,
		Fields: fields,
		Headers: map[string]string{
			"Accept": "application/json",
		},
	}, nil
}

type canvasFileDetails struct {
	FolderID any `json:"folder_id"`
}

type canvasUploadTarget struct {
	UploadURL    string         `json:"upload_url"`
	UploadParams map[string]any `json:"upload_params"`
}

func (p *CanvasLMSProvider) asCanvasCourseFile(file domain.CourseFile) (canvasFile, error) {
	fileID, ok := stringifyCanvasID(file.ExternalData["file_id"])
	if !ok || fileID == "" {
		return canvasFile{}, apperr.Internal("Missing or invalid file ID in mapping data")
	}

	return canvasFile{fileID: fileID}, nil
}

func (p *CanvasLMSProvider) getFileFolderID(ctx context.Context, userID int64, courseID string, fileID string) (string, error) {
	response, err := p.doAuthenticatedRequest(ctx, CanvasRequest{
		Path:   "/api/v1/courses/" + courseID + "/files/" + fileID,
		Method: http.MethodGet,
		Config: p.config,
		UserID: userID,
	})
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

func (p *CanvasLMSProvider) CompleteFileUpload(
	ctx context.Context,
	principal auth.Principal,
	course domain.LMSCourse,
	file domain.CourseFile,
	newFileName string,
	uploadResponse map[string]any,
) (domain.UploadedFile, error) {
	canvasCourse, err := p.asCanvasCourse(course)
	if err != nil {
		return domain.UploadedFile{}, err
	}
	_, err = p.asCanvasCourseFile(file)
	if err != nil {
		return domain.UploadedFile{}, err
	}

	uploadedFileID, ok := stringifyCanvasID(uploadResponse["id"])
	if !ok || uploadedFileID == "" {
		return domain.UploadedFile{}, apperr.Validation("Canvas upload response is missing a valid file ID")
	}

	response, err := p.doAuthenticatedRequest(ctx, CanvasRequest{
		Path:   "/api/v1/courses/" + canvasCourse.courseID + "/files/" + uploadedFileID,
		Method: http.MethodGet,
		Config: p.config,
		UserID: principal.AgentID,
	})
	if err != nil {
		return domain.UploadedFile{}, err
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		return domain.UploadedFile{}, apperr.Internal(fmt.Sprintf("Failed to get uploaded Canvas file: unexpected status code: %d", response.StatusCode))
	}

	var uploadedFile CanvasFileResponse
	if err := json.NewDecoder(response.Body).Decode(&uploadedFile); err != nil {
		return domain.UploadedFile{}, apperr.Internal("Failed to decode uploaded Canvas file", apperr.WithCause(err))
	}

	if uploadedFile.ID == 0 {
		return domain.UploadedFile{}, apperr.Internal("Uploaded Canvas file is missing an ID")
	}
	if strconv.FormatInt(uploadedFile.ID, 10) != uploadedFileID {
		return domain.UploadedFile{}, apperr.Validation("Uploaded Canvas file ID does not match the upload response")
	}
	if uploadedFile.DisplayName == "" {
		return domain.UploadedFile{}, apperr.Internal("Uploaded Canvas file is missing a file name")
	}
	if uploadedFile.URL == "" {
		return domain.UploadedFile{}, apperr.Internal("Uploaded Canvas file is missing a download URL")
	}
	updatedAt := parseCanvasUpdatedAt(uploadedFile.UpdatedAt)
	if updatedAt.IsZero() {
		return domain.UploadedFile{}, apperr.Internal("Uploaded Canvas file has an invalid updated timestamp")
	}

	return domain.UploadedFile{
		FileName:    uploadedFile.DisplayName,
		FileType:    uploadedFile.MimeClass,
		UpdatedAt:   updatedAt,
		FileSize:    uploadedFile.Size,
		DownloadURL: uploadedFile.URL,
		ExternalID:  "file:" + strconv.FormatInt(uploadedFile.ID, 10),
		ExternalData: map[string]any{
			"file_id": uploadedFile.ID,
		},
	}, nil
}

func (p *CanvasLMSProvider) asCanvasFile(file domain.LMSFile) (canvasFile, error) {
	fileID, ok := file.ExternalData["file_id"].(string)
	if !ok {
		return canvasFile{}, apperr.Internal("Missing or invalid file ID in mapping data")
	}

	return canvasFile{fileID: fileID}, nil
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
