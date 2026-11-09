package application

import (
	"context"
	"errors"
	"testing"
	"time"

	"rewritetest/internal/accessibility/internal/domain"
	"rewritetest/internal/lms"
	"rewritetest/internal/shared/auth"
)

type replacementFileIssueReader struct {
	issue *domain.FileIssue
}

func (r replacementFileIssueReader) GetByID(context.Context, int64) (*domain.FileIssue, error) {
	return r.issue, nil
}

type replacementFileDataService struct {
	file   lms.File
	course lms.Course
}

func (s *replacementFileDataService) GetFile(context.Context, int64) (lms.File, error) {
	return s.file, nil
}

func (s *replacementFileDataService) GetCourse(context.Context, int64) (lms.Course, error) {
	return s.course, nil
}

type replacementFileUploader struct {
	beginRequest    lms.BeginFileUploadRequest
	completeRequest lms.CompleteFileUploadRequest
	beginResult     lms.FileUploadInstruction
	completeResult  lms.UploadedFile
	completeErr     error
	beginCalled     bool
	completeCalled  bool
}

func (u *replacementFileUploader) BeginFileUpload(_ context.Context, request lms.BeginFileUploadRequest) (lms.FileUploadInstruction, error) {
	u.beginRequest = request
	u.beginCalled = true
	return u.beginResult, nil
}

func (u *replacementFileUploader) CompleteFileUpload(_ context.Context, request lms.CompleteFileUploadRequest) (lms.UploadedFile, error) {
	u.completeRequest = request
	u.completeCalled = true
	return u.completeResult, u.completeErr
}

type replacementSessionRepository struct {
	sessions map[string]domain.FileUploadSession
}

func (r *replacementSessionRepository) Create(_ context.Context, session domain.FileUploadSession) (domain.FileUploadSession, error) {
	if r.sessions == nil {
		r.sessions = make(map[string]domain.FileUploadSession)
	}
	r.sessions[session.ID] = session
	return session, nil
}

func (r *replacementSessionRepository) GetByID(_ context.Context, id string) (*domain.FileUploadSession, error) {
	session, ok := r.sessions[id]
	if !ok {
		return nil, nil
	}
	return &session, nil
}

func (r *replacementSessionRepository) DeleteByID(_ context.Context, id string) error {
	delete(r.sessions, id)
	return nil
}

func replacementContext() (*domain.FileIssue, lms.File, lms.Course, auth.Principal) {
	issue, err := domain.RehydrateFileIssue(9, 34, nil, nil, time.Now(), time.Now())
	if err != nil {
		panic(err)
	}
	file := lms.File{
		ID:           34,
		CourseID:     12,
		FileName:     "old.pdf",
		FileType:     "application/pdf",
		UpdatedAt:    time.Date(2026, time.October, 23, 12, 0, 0, 0, time.UTC),
		FileSize:     100,
		DownloadURL:  "https://lms.example/files/34",
		ExternalID:   "file:34",
		ExternalData: map[string]any{"file_id": int64(34), "context_type": "Course"},
	}
	course := lms.Course{
		ID:           12,
		TenantID:     7,
		ExternalID:   "course:12",
		ExternalData: map[string]any{"course_id": "42"},
	}
	principal := auth.Principal{AgentID: 17, TenantID: 7}
	return issue, file, course, principal
}

func TestBeginFileReplacementUsesIssueContext(t *testing.T) {
	issue, file, course, principal := replacementContext()
	uploader := &replacementFileUploader{
		beginResult: lms.FileUploadInstruction{Method: "POST", URL: "https://upload.example"},
	}
	sessions := &replacementSessionRepository{}

	useCase := NewBeginFileReplacementUseCase(
		replacementFileIssueReader{issue: issue},
		&replacementFileDataService{file: file, course: course},
		&replacementFileDataService{file: file, course: course},
		uploader,
		sessions,
		15*time.Minute,
	)

	got, err := useCase.Execute(context.Background(), BeginFileReplacementCommand{
		Principal:   principal,
		FileIssueID: issue.ID(),
		NewFileName: "new.pdf",
	})
	if err != nil {
		t.Fatalf("Execute returned error: %v", err)
	}

	if !uploader.beginCalled || got.Instruction.URL != "https://upload.example" || got.UploadSessionID == "" {
		t.Fatalf("expected begin upload delegation, got called=%v result=%+v", uploader.beginCalled, got)
	}
	if uploader.beginRequest.File.ID != file.ID || uploader.beginRequest.Course.ID != course.ID {
		t.Fatalf("unexpected upload context: %+v", uploader.beginRequest)
	}
	if uploader.beginRequest.Principal != principal {
		t.Fatalf("unexpected principal: %+v", uploader.beginRequest.Principal)
	}
}

func TestBeginFileReplacementRejectsWrongTenantBeforeUpload(t *testing.T) {
	issue, file, course, principal := replacementContext()
	course.TenantID = principal.TenantID + 1
	uploader := &replacementFileUploader{}
	sessions := &replacementSessionRepository{}

	useCase := NewBeginFileReplacementUseCase(
		replacementFileIssueReader{issue: issue},
		&replacementFileDataService{file: file, course: course},
		&replacementFileDataService{file: file, course: course},
		uploader,
		sessions,
		15*time.Minute,
	)

	_, err := useCase.Execute(context.Background(), BeginFileReplacementCommand{
		Principal:   principal,
		FileIssueID: issue.ID(),
		NewFileName: "new.pdf",
	})
	if err == nil || !contains(err.Error(), "access") {
		t.Fatalf("expected access error, got %v", err)
	}
	if uploader.beginCalled {
		t.Fatal("upload should not be started for another tenant")
	}
}

func TestCompleteFileReplacementPersistsUploadedMetadata(t *testing.T) {
	issue, file, course, principal := replacementContext()
	updatedAt := time.Date(2026, time.October, 24, 12, 0, 0, 0, time.UTC)
	uploader := &replacementFileUploader{
		completeResult: lms.UploadedFile{
			FileName:     "new.pdf",
			FileType:     "application/pdf",
			UpdatedAt:    updatedAt,
			FileSize:     200,
			DownloadURL:  "https://lms.example/files/55",
			ExternalID:   "file:55",
			ExternalData: map[string]any{"file_id": int64(55), "context_type": "Course"},
		},
	}
	dataService := &replacementFileDataService{file: file, course: course}
	sessions := &replacementSessionRepository{sessions: map[string]domain.FileUploadSession{
		"session-1": {
			ID: "session-1", UserID: principal.AgentID, TenantID: principal.TenantID,
			FileIssueID: issue.ID(), FileID: file.ID, NewFileName: "new.pdf",
		},
	}}

	useCase := NewCompleteFileReplacementUseCase(
		replacementFileIssueReader{issue: issue},
		dataService,
		dataService,
		uploader,
		sessions,
	)

	got, err := useCase.Execute(context.Background(), CompleteFileReplacementCommand{
		Principal:       principal,
		FileIssueID:     issue.ID(),
		UploadSessionID: "session-1",
		UploadResponse:  map[string]any{"id": 55},
	})
	if err != nil {
		t.Fatalf("Execute returned error: %v", err)
	}

	if !uploader.completeCalled {
		t.Fatalf("expected completion upload, completed=%v", uploader.completeCalled)
	}
	if got.ExternalID != "file:55" || got.FileName != "new.pdf" || !got.UpdatedAt.Equal(updatedAt) {
		t.Fatalf("unexpected returned file: %+v", got)
	}
	if _, exists := sessions.sessions["session-1"]; exists {
		t.Fatal("upload session should be removed after successful completion")
	}
}

func TestCompleteFileReplacementKeepsSessionWhenProviderReplacementFails(t *testing.T) {
	issue, file, course, principal := replacementContext()
	uploader := &replacementFileUploader{completeErr: errors.New("Canvas reference update failed")}
	sessions := &replacementSessionRepository{sessions: map[string]domain.FileUploadSession{
		"session-1": {
			ID: "session-1", UserID: principal.AgentID, TenantID: principal.TenantID,
			FileIssueID: issue.ID(), FileID: file.ID, NewFileName: "new.pdf",
		},
	}}
	dataService := &replacementFileDataService{file: file, course: course}
	useCase := NewCompleteFileReplacementUseCase(replacementFileIssueReader{issue: issue}, dataService, dataService, uploader, sessions)

	_, err := useCase.Execute(context.Background(), CompleteFileReplacementCommand{
		Principal: principal, FileIssueID: issue.ID(), UploadSessionID: "session-1", UploadResponse: map[string]any{"id": 55},
	})
	if err == nil {
		t.Fatal("expected provider error")
	}
	if _, exists := sessions.sessions["session-1"]; !exists {
		t.Fatal("upload session should remain available for retry")
	}
}

func contains(value, substring string) bool {
	for i := 0; i+len(substring) <= len(value); i++ {
		if value[i:i+len(substring)] == substring {
			return true
		}
	}
	return false
}
