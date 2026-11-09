package application

import (
	"context"
	"errors"
	"testing"
	"time"

	"rewritetest/internal/accessibility/internal/domain"
	"rewritetest/internal/accessibility/internal/infrastructure"
	"rewritetest/internal/lms"
	"rewritetest/internal/shared/auth"
)

type replacementFileDataService struct {
	file    lms.File
	course  lms.Course
	created []lms.File
}

func (s *replacementFileDataService) GetFile(context.Context, int64) (lms.File, error) {
	return s.file, nil
}

func (s *replacementFileDataService) GetCourse(context.Context, int64) (lms.Course, error) {
	return s.course, nil
}

func (s *replacementFileDataService) CreateReplacementFile(_ context.Context, courseID int64, uploaded lms.UploadedFile) (lms.File, error) {
	created := lms.File{
		ID: int64(100 + len(s.created)), CourseID: courseID, IsReplacement: true, FileName: uploaded.FileName,
		FileType: uploaded.FileType, UpdatedAt: uploaded.UpdatedAt, FileSize: uploaded.FileSize,
		DownloadURL: uploaded.DownloadURL, ExternalID: uploaded.ExternalID, ExternalData: uploaded.ExternalData,
	}
	s.created = append(s.created, created)
	return created, nil
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
	sessions := infrastructure.NewMapMockFileUploadSessionRepository()

	useCase := NewBeginFileReplacementUseCase(
		&infrastructure.MockFileIssueRepository{GetByIDFunc: func(context.Context, int64) (*domain.FileIssue, error) { return issue, nil }},
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
	sessions := infrastructure.NewMapMockFileUploadSessionRepository()

	useCase := NewBeginFileReplacementUseCase(
		&infrastructure.MockFileIssueRepository{GetByIDFunc: func(context.Context, int64) (*domain.FileIssue, error) { return issue, nil }},
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
	if err == nil || !contains(err.Error(), "Course not found") {
		t.Fatalf("expected hidden cross-tenant course, got %v", err)
	}
	if uploader.beginCalled {
		t.Fatal("upload should not be started for another tenant")
	}
}

func TestCompleteFileReplacementCreatesSeparateResolvedFile(t *testing.T) {
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
	var updatedIssue *domain.FileIssue
	issueReader := &infrastructure.MockFileIssueRepository{
		GetByIDFunc: func(context.Context, int64) (*domain.FileIssue, error) { return issue, nil },
		UpdateFunc: func(_ context.Context, updated *domain.FileIssue) error {
			updatedIssue = updated
			return nil
		},
	}
	sessions := infrastructure.NewMapMockFileUploadSessionRepository()
	_, err := sessions.Create(context.Background(), domain.FileUploadSession{
		ID: "session-1", UserID: principal.AgentID, TenantID: principal.TenantID,
		FileIssueID: issue.ID(), FileID: file.ID, NewFileName: "new.pdf",
	})
	if err != nil {
		t.Fatalf("seed upload session: %v", err)
	}

	useCase := NewCompleteFileReplacementUseCase(
		issueReader,
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
	if got.ID == file.ID || got.ExternalID != "file:55" || got.FileName != "new.pdf" || !got.UpdatedAt.Equal(updatedAt) || !got.IsReplacement {
		t.Fatalf("unexpected returned file: %+v", got)
	}
	if got.ID != 100 || len(dataService.created) != 1 || dataService.created[0].ID == file.ID {
		t.Fatalf("replacement should be a separate persisted file record: old=%+v created=%+v result=%+v", file, dataService.created, got)
	}
	if updatedIssue != issue || !updatedIssue.IsReviewed() {
		t.Fatalf("original file issue should be marked reviewed: %+v", updatedIssue)
	}
	if reviewerID, err := updatedIssue.ReviewerID(); err != nil || reviewerID != principal.AgentID {
		t.Fatalf("unexpected reviewer recorded on original issue: id=%d err=%v", reviewerID, err)
	}
	if file.ID != 34 || file.ExternalID != "file:34" {
		t.Fatalf("original file record was modified: %+v", file)
	}
	remaining, err := sessions.GetByID(context.Background(), "session-1")
	if err != nil {
		t.Fatalf("get upload session: %v", err)
	}
	if remaining != nil {
		t.Fatal("upload session should be removed after successful completion")
	}
}

func TestCompleteFileReplacementKeepsSessionWhenProviderReplacementFails(t *testing.T) {
	issue, file, course, principal := replacementContext()
	uploader := &replacementFileUploader{completeErr: errors.New("Canvas reference update failed")}
	sessions := infrastructure.NewMapMockFileUploadSessionRepository()
	_, err := sessions.Create(context.Background(), domain.FileUploadSession{
		ID: "session-1", UserID: principal.AgentID, TenantID: principal.TenantID,
		FileIssueID: issue.ID(), FileID: file.ID, NewFileName: "new.pdf",
	})
	if err != nil {
		t.Fatalf("seed upload session: %v", err)
	}
	dataService := &replacementFileDataService{file: file, course: course}
	issueReader := &infrastructure.MockFileIssueRepository{GetByIDFunc: func(context.Context, int64) (*domain.FileIssue, error) { return issue, nil }}
	useCase := NewCompleteFileReplacementUseCase(issueReader, dataService, dataService, uploader, sessions)

	_, err = useCase.Execute(context.Background(), CompleteFileReplacementCommand{
		Principal: principal, FileIssueID: issue.ID(), UploadSessionID: "session-1", UploadResponse: map[string]any{"id": 55},
	})
	if err == nil {
		t.Fatal("expected provider error")
	}
	remaining, err := sessions.GetByID(context.Background(), "session-1")
	if err != nil {
		t.Fatalf("get upload session: %v", err)
	}
	if remaining == nil {
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
