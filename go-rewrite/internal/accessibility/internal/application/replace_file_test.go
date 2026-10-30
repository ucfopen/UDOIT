package application

import (
	"context"
	"testing"
	"time"

	"rewritetest/internal/accessibility/internal/domain"
	"rewritetest/internal/lms"
	"rewritetest/internal/lmsdata"
	"rewritetest/internal/shared/auth"
)

type replacementFileIssueReader struct {
	issue *domain.FileIssue
}

func (r replacementFileIssueReader) GetByID(context.Context, int64) (*domain.FileIssue, error) {
	return r.issue, nil
}

type replacementFileDataService struct {
	file         lmsdata.File
	course       lmsdata.Course
	updatedFile  lmsdata.File
	updateCalled bool
}

func (s *replacementFileDataService) GetFile(context.Context, int64) (lmsdata.File, error) {
	return s.file, nil
}

func (s *replacementFileDataService) UpdateFile(_ context.Context, file lmsdata.File) error {
	s.updatedFile = file
	s.updateCalled = true
	return nil
}

func (s *replacementFileDataService) GetCourse(context.Context, int64) (lmsdata.Course, error) {
	return s.course, nil
}

type replacementFileUploader struct {
	beginRequest    lms.BeginFileUploadRequest
	completeRequest lms.CompleteFileUploadRequest
	beginResult     lms.FileUploadInstruction
	completeResult  lms.UploadedFile
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
	return u.completeResult, nil
}

type replacementSessionRepository struct {
	sessions map[string]domain.FileUploadSession
}

func (r *replacementSessionRepository) Create(_ context.Context, session domain.FileUploadSession) error {
	if r.sessions == nil {
		r.sessions = make(map[string]domain.FileUploadSession)
	}
	r.sessions[session.ID] = session
	return nil
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

func replacementContext() (*domain.FileIssue, lmsdata.File, lmsdata.Course, auth.Principal) {
	issue, err := domain.RehydrateFileIssue(9, 34, nil, nil, time.Now(), time.Now())
	if err != nil {
		panic(err)
	}
	file := lmsdata.File{
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
	course := lmsdata.Course{
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

	if !uploader.completeCalled || !dataService.updateCalled {
		t.Fatalf("expected completion and persistence, completed=%v updated=%v", uploader.completeCalled, dataService.updateCalled)
	}
	if got.ExternalID != "file:55" || got.FileName != "new.pdf" || !got.UpdatedAt.Equal(updatedAt) {
		t.Fatalf("unexpected returned file: %+v", got)
	}
	if dataService.updatedFile.ExternalID != "file:55" || dataService.updatedFile.FileSize != 200 {
		t.Fatalf("unexpected persisted file: %+v", dataService.updatedFile)
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
