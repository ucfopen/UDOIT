package application

import (
	"context"
	"time"

	"rewritetest/internal/accessibility/internal/domain"
	"rewritetest/internal/lms"
	"rewritetest/internal/lmsdata"
	"rewritetest/internal/shared/apperr"
	"rewritetest/internal/shared/auth"

	"github.com/google/uuid"
)

type FileIssueReader interface {
	GetByID(context.Context, int64) (*domain.FileIssue, error)
}

type FileDataService interface {
	GetFile(context.Context, int64) (lmsdata.File, error)
	UpdateFile(context.Context, lmsdata.File) error
	GetCourse(context.Context, int64) (lmsdata.Course, error)
}

type AccessibilityDataService interface {
	LMSDataService
	FileDataService
}

type FileUploader interface {
	BeginFileUpload(context.Context, lms.BeginFileUploadRequest) (lms.FileUploadInstruction, error)
	CompleteFileUpload(context.Context, lms.CompleteFileUploadRequest) (lms.UploadedFile, error)
}

type BeginFileReplacementCommand struct {
	Principal   auth.Principal
	FileIssueID int64
	NewFileName string
	NewFileSize int64
}

type BeginFileReplacementResult struct {
	UploadSessionID string
	Instruction     lms.FileUploadInstruction
}

type BeginFileReplacementUseCase struct {
	fileIssueReader FileIssueReader
	fileDataService FileDataService
	fileUploader    FileUploader
	sessionRepo     domain.FileUploadSessionRepository
	sessionTTL      time.Duration
}

func NewBeginFileReplacementUseCase(
	fileIssueReader FileIssueReader,
	fileDataService FileDataService,
	fileUploader FileUploader,
	sessionRepo domain.FileUploadSessionRepository,
	sessionTTL time.Duration,
) *BeginFileReplacementUseCase {
	return &BeginFileReplacementUseCase{
		fileIssueReader: fileIssueReader,
		fileDataService: fileDataService,
		fileUploader:    fileUploader,
		sessionRepo:     sessionRepo,
		sessionTTL:      sessionTTL,
	}
}

func (u *BeginFileReplacementUseCase) Execute(ctx context.Context, cmd BeginFileReplacementCommand) (BeginFileReplacementResult, error) {
	file, course, err := loadFileContext(ctx, u.fileIssueReader, u.fileDataService, cmd.Principal, cmd.FileIssueID)
	if err != nil {
		return BeginFileReplacementResult{}, err
	}

	instruction, err := u.fileUploader.BeginFileUpload(ctx, lms.BeginFileUploadRequest{
		Principal:   cmd.Principal,
		Course:      toLMSCourseInfo(course),
		File:        toLMSFileInfo(file),
		NewFileName: cmd.NewFileName,
		NewFileSize: cmd.NewFileSize,
	})
	if err != nil {
		return BeginFileReplacementResult{}, err
	}

	sessionID := uuid.NewString()
	expiresAt := time.Now().Add(u.sessionTTL)
	if err := u.sessionRepo.Create(ctx, domain.FileUploadSession{
		ID:          sessionID,
		UserID:      cmd.Principal.AgentID,
		TenantID:    cmd.Principal.TenantID,
		FileIssueID: cmd.FileIssueID,
		FileID:      file.ID,
		NewFileName: cmd.NewFileName,
		NewFileSize: cmd.NewFileSize,
		ExpiresAt:   expiresAt,
	}); err != nil {
		return BeginFileReplacementResult{}, err
	}

	return BeginFileReplacementResult{
		UploadSessionID: sessionID,
		Instruction:     instruction,
	}, nil
}

type CompleteFileReplacementCommand struct {
	Principal       auth.Principal
	FileIssueID     int64
	UploadSessionID string
	UploadResponse  map[string]any
}

type CompleteFileReplacementUseCase struct {
	fileIssueReader FileIssueReader
	fileDataService FileDataService
	fileUploader    FileUploader
	sessionRepo     domain.FileUploadSessionRepository
}

func NewCompleteFileReplacementUseCase(
	fileIssueReader FileIssueReader,
	fileDataService FileDataService,
	fileUploader FileUploader,
	sessionRepo domain.FileUploadSessionRepository,
) *CompleteFileReplacementUseCase {
	return &CompleteFileReplacementUseCase{
		fileIssueReader: fileIssueReader,
		fileDataService: fileDataService,
		fileUploader:    fileUploader,
		sessionRepo:     sessionRepo,
	}
}

func (u *CompleteFileReplacementUseCase) Execute(ctx context.Context, cmd CompleteFileReplacementCommand) (lmsdata.File, error) {
	session, err := u.sessionRepo.GetByID(ctx, cmd.UploadSessionID)
	if err != nil {
		return lmsdata.File{}, err
	}
	if session == nil || session.UserID != cmd.Principal.AgentID || session.TenantID != cmd.Principal.TenantID || session.FileIssueID != cmd.FileIssueID {
		return lmsdata.File{}, apperr.New(apperr.CodeNotFound, "Upload session not found")
	}
	if err := u.sessionRepo.DeleteByID(ctx, cmd.UploadSessionID); err != nil {
		return lmsdata.File{}, err
	}

	file, course, err := loadFileContext(ctx, u.fileIssueReader, u.fileDataService, cmd.Principal, cmd.FileIssueID)
	if err != nil {
		return lmsdata.File{}, err
	}
	if file.ID != session.FileID {
		return lmsdata.File{}, apperr.New(apperr.CodeNotFound, "Upload session not found")
	}

	uploadedFile, err := u.fileUploader.CompleteFileUpload(ctx, lms.CompleteFileUploadRequest{
		Principal:      cmd.Principal,
		Course:         toLMSCourseInfo(course),
		File:           toLMSFileInfo(file),
		NewFileName:    session.NewFileName,
		UploadResponse: cmd.UploadResponse,
	})
	if err != nil {
		return lmsdata.File{}, err
	}

	// This does nothing but satisfy a previous type return requirement. The type
	// that will be returned will be updated in the future.
	updatedFile := file
	updatedFile.FileName = uploadedFile.FileName
	updatedFile.FileType = uploadedFile.FileType
	updatedFile.UpdatedAt = uploadedFile.UpdatedAt
	updatedFile.FileSize = uploadedFile.FileSize
	updatedFile.DownloadURL = uploadedFile.DownloadURL
	updatedFile.ExternalID = uploadedFile.ExternalID
	updatedFile.ExternalData = uploadedFile.ExternalData

	return updatedFile, nil
}

func loadFileContext(
	ctx context.Context,
	fileIssueReader FileIssueReader,
	fileDataService FileDataService,
	principal auth.Principal,
	fileIssueID int64,
) (lmsdata.File, lmsdata.Course, error) {
	issue, err := fileIssueReader.GetByID(ctx, fileIssueID)
	if err != nil {
		return lmsdata.File{}, lmsdata.Course{}, err
	}
	if issue == nil {
		return lmsdata.File{}, lmsdata.Course{}, apperr.New(apperr.CodeNotFound, "File issue not found")
	}

	file, err := fileDataService.GetFile(ctx, issue.FileID())
	if err != nil {
		return lmsdata.File{}, lmsdata.Course{}, err
	}

	course, err := fileDataService.GetCourse(ctx, file.CourseID)
	if err != nil {
		return lmsdata.File{}, lmsdata.Course{}, err
	}
	if course.TenantID != principal.TenantID {
		return lmsdata.File{}, lmsdata.Course{}, apperr.Forbidden("You do not have access to this file issue")
	}

	return file, course, nil
}

func toLMSFileInfo(file lmsdata.File) lms.FileInfo {
	return lms.FileInfo{
		ID:           file.ID,
		FileName:     file.FileName,
		FileType:     file.FileType,
		UpdatedAt:    file.UpdatedAt,
		FileSize:     file.FileSize,
		DownloadURL:  file.DownloadURL,
		ExternalID:   file.ExternalID,
		ExternalData: file.ExternalData,
	}
}

func toLMSCourseInfo(course lmsdata.Course) lms.CourseInfo {
	return lms.CourseInfo{
		ID:           course.ID,
		ExternalID:   course.ExternalID,
		ExternalData: course.ExternalData,
	}
}
